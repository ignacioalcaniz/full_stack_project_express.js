
import { ticketServices } from "../services/ticket.services.js";
import { createResponse } from "../utils/user.utils.js";

export default class TicketController {
  constructor(services) {
    this.services = services;
  }

  async generateTicket(req, res, next) {
    try {
     const user = req.user;
     const ticket = await this.services.generateTicket(user)
     createResponse(res, 201, ticket)
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController(ticketServices);