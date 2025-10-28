// src/services/ticket.services.js
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

    // recorremos productos del carrito y tomamos snapshot del producto actual en DB
    for (const { product, quantity } of cart.products) {
      const prodDB = await productServices.getById(product);
      if (!prodDB) throw new CustomError("Producto no encontrado", 404);

      // calcula subtotal y suma total
      const subtotal = quantity * (prodDB.precio || 0);
      total += subtotal;

      // Guardamos snapshot incluyendo la imagen (prop 'imagen' en tu model de producto)
      productSnapshots.push({
        productId: prodDB._id,
        title: prodDB.nombre || "Producto",
        price: prodDB.precio || 0,
        quantity,
        subtotal,
        imagen: prodDB.imagen || null, // <-- aquí agregamos la imagen
      });
    }

    // Guardamos ticket con productos incluidos
    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: user.email,
      products: productSnapshots,
    });

    // vaciamos carrito
    await cartServices.clearCart(user.cart);

    // enviamos mail con el ticket (si tu plantilla lo utiliza, usará ticket.products[].imagen)
    await sendPurchaseEmail({
      user,
      ticket: ticket.toObject ? ticket.toObject() : ticket,
    });

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);






































