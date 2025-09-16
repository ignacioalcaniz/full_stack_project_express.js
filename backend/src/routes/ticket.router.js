import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { ticketController } from "../controllers/ticket.controller.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { ticketSchema } from "../model/ticket.model.js";

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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *                 description: ID del carrito (opcional, se puede tomar del usuario autenticado)
 *                 example: 64f2c3e8d2e4c81234567890
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
  [passportCall("jwt", { session: false }), validateSchema(ticketSchema)],
  ticketController.generateTicket
);

export default TicketRouter;

