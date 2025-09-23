import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { sendPurchaseEmail } from "./email.services.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { CustomError } from "../utils/error.custom.js";

class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateTicket = async (user) => {
    if (!user) throw new CustomError("Usuario no autenticado", 401);

    const cart = await cartServices.getById(user.cart);
    if (!cart || !cart.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let amountAcc = 0;
    const productsDetail = [];

    for (const prod of cart.products) {
      const prodDB = await productServices.getById(prod.product);
      if (!prodDB) throw new CustomError("Producto no encontrado", 404);

      if (prod.quantity > prodDB.stock) {
        throw new CustomError(
          `Cantidad de ${prodDB.nombre} supera stock`,
          404
        );
      }

      const subTotal = prod.quantity * (prodDB.precio || 0);
      amountAcc += subTotal;

      // 🔑 Mapear los campos reales de tu model de productos
      productsDetail.push({
        title: prodDB.nombre || "Producto",
        description: prodDB.descripcion || "",
        image: prodDB.imagen || "",
        quantity: prod.quantity,
        price: prodDB.precio || 0,
      });
    }

    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date().toISOString(),
      amount: amountAcc,
      purchaser: user.email,
    });

    await cartServices.clearCart(user.cart);

    // Enviamos el email con user completo y productos bien mapeados
    await sendPurchaseEmail({
      user,
      ticket: {
        ...ticket.toObject?.() || ticket,
        products: productsDetail,
      },
    });

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);




































