// src/services/ticket.services.js
import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { sendPurchaseEmail } from "./email.services.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { CustomError } from "../utils/error.custom.js";

export default class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateTicket = async (user) => {
    if (!user) throw new CustomError("Usuario no autenticado", 401);

    // Carrito del usuario
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
          `La cantidad de ${prodDB.nombre || prodDB.title} supera stock`,
          404
        );
      }

      const subTotal = prod.quantity * (prodDB.price || 0);
      amountAcc += subTotal;

      productsDetail.push({
        title: prodDB.nombre || prodDB.title || "Producto",
        description: prodDB.descripcion || "",
        image: prodDB.imagen || "",
        quantity: prod.quantity,
        price: prodDB.price || 0,
      });
    }

    // Guardar ticket en DB
    const ticket = await this.dao.create({
      code: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchase_datetime: new Date().toISOString(),
      amount: amountAcc,
      purchaser: user.email,
    });

    // Vaciar carrito
    await cartServices.clearCart(user.cart);

    // Enviar email con los detalles, asegurando first_name siempre
    const firstNameForEmail = user?.first_name || user?.name || "Cliente";

    sendPurchaseEmail({
      first_name: firstNameForEmail,
      purchaserEmail: user?.email || "cliente@correo.com",
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
































