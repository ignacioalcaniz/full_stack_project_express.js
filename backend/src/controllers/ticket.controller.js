// src/controllers/ticket.controller.js
import { ticketServices } from "../services/ticket.services.js";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

export const ticketController = {
  /**
   * 🧾 Generar un nuevo ticket de compra
   */
  generateTicket: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // ✅ Obtenemos el usuario completo desde la base de datos
      const user = await userServices.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (!user.cart) {
        return res.status(404).json({ error: "El usuario no tiene carrito asignado" });
      }

      // ✅ Generamos el ticket pasando el usuario completo
      const ticket = await ticketServices.generateTicket(user);

      req.logger?.info?.(`🎟️ Ticket generado correctamente para el usuario ${user.email}`);
      createResponse(res, 201, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al generar ticket: ${error.message}`);
      next(error);
    }
  },

  /**
   * 🔍 Obtener ticket por ID
   */
  getById: async (req, res, next) => {
    try {
      const { tid } = req.params;
      const ticket = await ticketServices.dao.getById(tid);

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

















