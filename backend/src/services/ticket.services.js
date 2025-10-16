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

    let total = 0;
    const productSnapshots = [];

    for (const { product, quantity } of cart.products) {
      const prodDB = await productServices.getById(product);
      if (!prodDB) throw new CustomError("Producto no encontrado", 404);

      const subtotal = quantity * (prodDB.precio || 0);
      total += subtotal;

      productSnapshots.push({
        productId: prodDB._id,
        title: prodDB.nombre,
        price: prodDB.precio,
        quantity,
        subtotal,
      });
    }

    // ✅ Guardamos el ticket con productos incluidos
    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: user.email,
      products: productSnapshots,
    });

    await cartServices.clearCart(user.cart);

    await sendPurchaseEmail({
      user,
      ticket: ticket.toObject ? ticket.toObject() : ticket,
    });

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);





































