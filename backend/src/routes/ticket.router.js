import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { ticketController } from "../controllers/ticket.controller.js";
import { validateObjectId } from "../Middlewares/validate.middleware.js";

const TicketRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Tickets
 *     description: Generación de tickets de compra
 */

/**
 * @swagger
 * /ticket/purchase:
 *   post:
 *     tags: [Tickets]
 *     summary: Generar un nuevo ticket de compra
 *     security:
 *       - bearerAuth: []
 */
TicketRouter.post("/purchase", [passportCall("jwt", { session: false })], ticketController.generateTicket);

/**
 * @swagger
 * /ticket/{tid}:
 *   get:
 *     tags: [Tickets]
 *     summary: Obtener ticket por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tid
 *         required: true
 *         schema:
 *           type: string
 */
TicketRouter.get("/:tid", [passportCall("jwt", { session: false }), validateObjectId("tid")], ticketController.getById);

export default TicketRouter;



