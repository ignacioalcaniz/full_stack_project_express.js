// src/controllers/ticket.controller.js
import { ticketServices } from "../services/ticket.services.js";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

export const ticketController = {
  generateTicket: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { paymentMethod = "card" } = req.body || {};

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const user = await userServices.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (!user.cart) {
        return res
          .status(404)
          .json({ error: "El usuario no tiene carrito asignado" });
      }

      const ticket = await ticketServices.generateTicket(user, paymentMethod);

      req.logger?.info?.(
        `🎟️ Ticket generado correctamente para el usuario ${user.email} con método ${paymentMethod}`
      );

      createResponse(res, 201, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al generar ticket: ${error.message}`);
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { tid } = req.params;
      const ticket = await ticketServices.getOrderById(tid);

      if (!ticket) {
        req.logger?.warn?.(`⚠️ Ticket no encontrado: id=${tid}`);
        return res.status(404).json({ error: "Ticket no encontrado" });
      }

      req.logger?.info?.(`📄 Ticket recuperado correctamente: id=${tid}`);
      createResponse(res, 200, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al obtener ticket: ${error.message}`);
      next(error);
    }
  },
};

















