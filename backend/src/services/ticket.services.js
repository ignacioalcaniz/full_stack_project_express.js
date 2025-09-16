import TicketDaoMongo from "../daos/ticket.dao.js";
import { sendPurchaseEmail } from "./email.services.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { CustomError } from "../utils/error.custom.js";

export default class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateTicket = async (user) => {
    const cart = await cartServices.getById(user.cart);
    if (!cart || !cart.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let amountAcc = 0;
    for (const prod of cart.products) {
      const idProd = prod.product;
      const prodDB = await productServices.getById(idProd);

      if (prod.quantity > prodDB.stock) {
        throw new CustomError(
          `La cantidad de ${prodDB.title} supera el stock disponible`,
          404
        );
      }
      amountAcc += prod.quantity * prodDB.price;
    }

    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date().toISOString(),
      amount: amountAcc,
      purchaser: user.email,
    });

    await cartServices.clearCart(user.cart);

    // Mail de compra (no bloqueante)
    sendPurchaseEmail({
      user,
      ticket: {
        ...ticket.toObject?.() || ticket,
        products: cart.products.map((p) => ({
          title: p.product?.title || "Producto",
          quantity: p.quantity,
          price: p.product?.price || 0,
        })),
      },
    }).catch((err) => console.error("⚠️ Error enviando email compra:", err.message));

    return ticket;
  };
}

export const ticketServices = new TicketServices(TicketDaoMongo);

