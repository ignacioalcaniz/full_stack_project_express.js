import { ticketServices } from "../services/ticket.services.js";
import { createResponse } from "../utils/user.utils.js";

class TicketController {
  constructor(services) {
    this.services = services;
  }

  generateTicket = async (req, res, next) => {
    try {
      const userJwt = req.user; // viene del JWT

      if (!userJwt) {
        req.logger?.warn?.("⚠️ No se encontró usuario en la request");
        return createResponse(res, 401, { error: "Usuario no autenticado" });
      }

      const ticket = await this.services.generateTicket(userJwt);

      req.logger?.info?.(`🎟️ Ticket generado para el usuario ${ticket.purchaser}`);

      createResponse(res, 201, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al generar ticket: ${error.message}`, { stack: error.stack });
      next(error);
    }
  };
}

export const ticketController = new TicketController(ticketServices);








