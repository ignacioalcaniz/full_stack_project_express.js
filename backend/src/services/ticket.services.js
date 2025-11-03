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
    if (!user.cart) throw new CustomError("El usuario no tiene carrito asignado", 404);

    const cart = await cartServices.getById(user.cart);
    if (!cart || !cart.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let total = 0;
    const productSnapshots = [];

    // 🧮 Recorremos los productos del carrito y tomamos snapshot del producto actual en DB
    for (const { product, quantity } of cart.products) {
      const prodDB = await productServices.getById(product);
      if (!prodDB) throw new CustomError("Producto no encontrado", 404);

      const subtotal = quantity * (prodDB.precio || 0);
      total += subtotal;

      // Snapshot con info actual del producto
      productSnapshots.push({
        productId: prodDB._id,
        title: prodDB.nombre || "Producto",
        price: prodDB.precio || 0,
        quantity,
        subtotal,
        imagen: prodDB.imagen || null,
      });
    }

    // 🎫 Crear el ticket en base de datos
    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: user.email,
      products: productSnapshots,
    });

    // 🧹 Vaciar carrito tras compra
    await cartServices.clearCart(user.cart);

    // 📧 Enviar email de compra
    await sendPurchaseEmail({
      user,
      ticket: ticket.toObject ? ticket.toObject() : ticket,
    });

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);







































