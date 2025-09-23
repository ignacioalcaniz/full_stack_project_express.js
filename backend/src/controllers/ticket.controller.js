import { ticketServices } from "../services/ticket.services.js";
import { createResponse } from "../utils/user.utils.js";

class TicketController {
  constructor(services) {
    this.services = services;
  }

  generateTicket = async (req, res, next) => {
    try {
      const user = req.user; // Viene completo desde passport-jwt

      if (!user) {
        req.logger?.warn?.("⚠️ No se encontró usuario en la request");
        return createResponse(res, 401, { error: "Usuario no autenticado" });
      }

      const ticket = await this.services.generateTicket(user);

      req.logger?.info?.(`🎟️ Ticket generado para ${ticket.purchaser}`);
      createResponse(res, 201, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al generar ticket: ${error.message}`, {
        stack: error.stack,
      });
      next(error);
    }
  };
}

export const ticketController = new TicketController(ticketServices);














