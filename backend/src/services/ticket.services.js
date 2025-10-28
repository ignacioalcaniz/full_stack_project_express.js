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

    // Obtenemos el carrito
    const cart = await cartServices.getById(user.cart);
    if (!cart || !cart.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    let total = 0;
    const productSnapshots = [];

    // Recorremos los productos del carrito
    for (const { product, quantity } of cart.products) {
      const prodDB = await productServices.getById(product);
      if (!prodDB) throw new CustomError("Producto no encontrado", 404);

      // Calcular subtotal
      const subtotal = quantity * (prodDB.precio || 0);
      total += subtotal;

      // Snapshot con imagen segura (imagen o image)
      productSnapshots.push({
        productId: prodDB._id,
        title: prodDB.nombre || "Producto",
        price: prodDB.precio || 0,
        quantity,
        subtotal,
        imagen: prodDB.imagen || prodDB.image || null, // 🔹 ambas variantes cubiertas
      });
    }

    // Crear el ticket
    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: user.email,
      products: productSnapshots,
    });

    // Limpiar carrito después de la compra
    await cartServices.clearCart(user.cart);

    // Aseguramos que el objeto enviado al email contenga los productos completos
    const ticketPlain = ticket.toObject ? ticket.toObject({ flattenMaps: true }) : ticket;

    // Enviar correo de confirmación
    await sendPurchaseEmail({
      user,
      ticket: {
        ...ticketPlain,
        products: productSnapshots, // 🔹 garantizamos que las imágenes viajen bien
      },
    });

    return ticket;
  };
}

export const ticketServices = new TicketServices(ticketDaoMongo);







































