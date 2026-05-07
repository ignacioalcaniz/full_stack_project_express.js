import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { sendPurchaseEmail } from "./email.services.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { CustomError } from "../utils/error.custom.js";
import { ProductModel } from "../model/product.model.js";
import { TicketModel } from "../model/ticket.model.js";
import { userDaoMongo } from "../daos/user.dao.js";

class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  buildTicketPayloadFromCart = async (user) => {
    if (!user) {
      throw new CustomError("Usuario no autenticado", 401);
    }

    if (!user.cart) {
      throw new CustomError("El usuario no tiene carrito asignado", 404);
    }

    const cart = await cartServices.getById(user.cart);

    if (!cart || !cart.products || cart.products.length === 0) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let total = 0;
    const purchasedProducts = [];
    const rejectedProducts = [];

    for (const item of cart.products) {
      const prodId = item.product?._id ?? item.product;
      const requestedQty = Number(item.quantity || 0);

      const prodDB = await productServices.getById(prodId);

      if (!prodDB) {
        rejectedProducts.push({
          productId: prodId,
          title: "Producto desconocido",
          reason: "Producto no encontrado",
          requested: requestedQty,
          purchased: 0,
        });
        continue;
      }

      if (prodDB.stock <= 0) {
        rejectedProducts.push({
          productId: prodDB._id,
          title: prodDB.nombre,
          reason: "Sin stock",
          requested: requestedQty,
          purchased: 0,
        });
        continue;
      }

      const purchQty = Math.min(requestedQty, prodDB.stock);
      const subtotal = purchQty * prodDB.precio;
      total += subtotal;

      purchasedProducts.push({
        productId: prodDB._id,
        title: prodDB.nombre,
        price: prodDB.precio,
        quantity: purchQty,
        subtotal,
        imagen: prodDB.imagen || null,
        image: prodDB.imagen || null,
      });

      if (requestedQty > purchQty) {
        rejectedProducts.push({
          productId: prodDB._id,
          title: prodDB.nombre,
          reason: "Stock insuficiente",
          requested: requestedQty,
          purchased: purchQty,
        });
      }
    }

    if (purchasedProducts.length === 0) {
      throw new CustomError(
        "No se pudo comprar ningún producto del carrito",
        400
      );
    }

    return {
      total,
      purchasedProducts,
      rejectedProducts,
    };
  };

  applyStockForProducts = async (products = []) => {
    for (const item of products) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        throw new CustomError(
          `Producto no encontrado al descontar stock: ${item.title}`,
          404
        );
      }

      if (Number(product.stock || 0) < Number(item.quantity || 0)) {
        throw new CustomError(
          `Stock insuficiente para "${item.title}" al confirmar el pago`,
          400
        );
      }
    }

    for (const item of products) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: -Number(item.quantity || 0),
          "stats.purchases": Number(item.quantity || 0),
        },
      });
    }
  };

  generateTicket = async (user, paymentMethod = "card", mpMeta = null) => {
    const allowedMethods = ["card", "transfer", "cash"];
    const safePaymentMethod = allowedMethods.includes(paymentMethod)
      ? paymentMethod
      : "card";

    if (
      mpMeta?.paymentId &&
      Number.isFinite(Number(mpMeta.paymentId))
    ) {
      const existing = await TicketModel.findOne({
        "mercadoPago.paymentId": Number(mpMeta.paymentId),
      }).lean();

      if (existing) {
        return {
          ticket: existing,
          rejectedProducts: [],
        };
      }
    }

    const { total, purchasedProducts, rejectedProducts } =
      await this.buildTicketPayloadFromCart(user);

    const isInstantPaid = safePaymentMethod === "card";

    if (isInstantPaid) {
      await this.applyStockForProducts(purchasedProducts);
    }

    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: user.email,
      status: isInstantPaid ? "completed" : "processing",
      paymentMethod: safePaymentMethod,
      paymentStatus: isInstantPaid ? "paid" : "pending",
      paymentConfirmedAt: isInstantPaid ? new Date() : null,
      paymentConfirmedBy: null,
      mercadoPago: mpMeta
        ? {
            paymentId: mpMeta.paymentId || null,
            preferenceId: mpMeta.preferenceId || null,
            merchantOrderId: mpMeta.merchantOrderId || null,
            externalReference: mpMeta.externalReference || null,
            status: mpMeta.status || null,
            statusDetail: mpMeta.statusDetail || null,
          }
        : undefined,
      products: purchasedProducts,
    });

    await cartServices.clearCart(user.cart);

    await sendPurchaseEmail({
      user,
      ticket: ticket.toObject ? ticket.toObject() : ticket,
      rejectedProducts,
    });

    return {
      ticket,
      rejectedProducts,
    };
  };

  finalizeMercadoPagoPayment = async (paymentData = {}) => {
    const paymentId = Number(paymentData.id || 0);
    const status = String(paymentData.status || "").toLowerCase();

    if (!paymentId) {
      throw new CustomError("paymentId inválido", 400);
    }

    if (status !== "approved") {
      return {
        ok: true,
        ignored: true,
        reason: `Estado no procesable: ${status || "unknown"}`,
      };
    }

    const existing = await TicketModel.findOne({
      "mercadoPago.paymentId": paymentId,
    }).lean();

    if (existing) {
      return {
        ok: true,
        duplicated: true,
        ticket: existing,
      };
    }

    const userId =
      paymentData.metadata?.userId ||
      paymentData.metadata?.user_id ||
      null;

    if (!userId) {
      throw new CustomError(
        "No se pudo resolver el usuario desde metadata.userId",
        400
      );
    }

    const user = await userDaoMongo.getUserById(userId);
    if (!user) {
      throw new CustomError("Usuario no encontrado para finalizar pago", 404);
    }

    return await this.generateTicket(user, "card", {
      paymentId,
      preferenceId: paymentData.order?.id || paymentData.preference_id || null,
      merchantOrderId: paymentData.order?.id || null,
      externalReference: paymentData.external_reference || null,
      status: paymentData.status || null,
      statusDetail: paymentData.status_detail || null,
    });
  };

  getOrderById = async (tid) => {
    const ticket = await TicketModel.findById(tid).lean();
    if (!ticket) return null;
    return this.normalizeOrders([ticket])[0] || null;
  };

  getOrdersByUserEmail = async (email) => {
    if (!email) return [];

    const tickets = await TicketModel.find({ purchaser: email })
      .sort({ purchase_datetime: -1, createdAt: -1 })
      .lean();

    return this.normalizeOrders(tickets);
  };

  normalizeOrders = (tickets = []) => {
    return tickets.map((t) => ({
      _id: t._id,
      code: t.code,
      amount: t.amount,
      status: t.status || "paid",
      paymentMethod: t.paymentMethod || "card",
      paymentStatus: t.paymentStatus || "paid",
      paymentConfirmedAt: t.paymentConfirmedAt || null,
      paymentConfirmedBy: t.paymentConfirmedBy || null,
      purchaser: t.purchaser,
      purchase_datetime: t.purchase_datetime,
      createdAt: t.createdAt,
      mercadoPago: t.mercadoPago || null,
      products: Array.isArray(t.products)
        ? t.products.map((p) => ({
            productId: p.productId || null,
            title: p.title || "Producto",
            quantity: Number(p.quantity || 0),
            price: Number(p.price || 0),
            subtotal: Number(p.subtotal || 0),
            imagen: p.imagen || p.image || null,
            image: p.image || p.imagen || null,
          }))
        : [],
    }));
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);









































