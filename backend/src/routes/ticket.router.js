import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { ticketController } from "../controllers/ticket.controller.js";

const TicketRouter = Router();

TicketRouter.post("/purchase", [passportCall('jwt', { session: false })], ticketController.generateTicket);

export default TicketRouter;