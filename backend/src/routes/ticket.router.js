// src/routes/ticket.router.js
import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { ticketController } from "../controllers/ticket.controller.js";

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
 *     summary: Generar un nuevo ticket de compra a partir del carrito del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Ticket generado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Error al generar el ticket (carrito vacío o inválido)
 *       401:
 *         description: No autorizado (falta o token inválido)
 *       500:
 *         description: Error interno del servidor
 */
TicketRouter.post(
  "/purchase",
  [passportCall("jwt", { session: false })],
  ticketController.generateTicket
);

export default TicketRouter;


