import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { sendPurchaseEmail } from "./email.services.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { userServices } from "./user.services.js";
import { CustomError } from "../utils/error.custom.js";

export default class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateTicket = async (jwtUser) => {
    if (!jwtUser) throw new CustomError("Usuario no autenticado", 401);

    // Traemos el usuario completo desde la DB
    const user = await userServices.getUserById(jwtUser.id);

    const cart = await cartServices.getById(user.cart);
    if (!cart || !cart.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let amountAcc = 0;
    const productsDetail = [];

    for (const prod of cart.products) {
      const prodDB = await productServices.getById(prod.product);
      if (!prodDB) throw new CustomError(`Producto no encontrado`, 404);
      if (prod.quantity > prodDB.stock)
        throw new CustomError(`Cantidad de ${prodDB.title} supera stock`, 404);

      const subTotal = prod.quantity * (prodDB.price || 0);
      amountAcc += subTotal;

      productsDetail.push({
        title: prodDB.title || "Producto",
        quantity: prod.quantity,
        price: prodDB.price || 0,
      });
    }

    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date().toISOString(),
      amount: amountAcc,
      purchaser: user.email || "sin-email@thelibrary.com",
    });

    await cartServices.clearCart(user.cart);

    sendPurchaseEmail({
      to: user.email || "sin-email@thelibrary.com",
      first_name: user.first_name || "Cliente",
      ticket: {
        ...ticket.toObject?.() || ticket,
        products: productsDetail,
      },
    }).catch((err) =>
      console.error("⚠️ Error enviando email de compra:", err.message)
    );

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);






















