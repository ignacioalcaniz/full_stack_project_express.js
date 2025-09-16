// src/controllers/ticket.controller.js
import { ticketServices } from "../services/ticket.services.js";
import { createResponse } from "../utils/user.utils.js";

class TicketController {
  constructor(services) {
    this.services = services;
  }

  async generateTicket(req, res, next) {
    try {
      const user = req.user;

      const ticket = await this.services.generateTicket(user);

      req.logger?.info?.(
        `🎟️ Ticket generado para el usuario ${user.email || user._id}`
      );
      createResponse(res, 201, ticket);
    } catch (error) {
      req.logger?.error?.(`❌ Error al generar ticket: ${error.message}`);
      next(error);
    }
  }
}

export const ticketController = new TicketController(ticketServices);
