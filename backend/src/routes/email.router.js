import { Router } from "express";
import { sendMailEth } from "../controllers/email.controller.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { emailSchema } from "../Middlewares/validators/email.validator.js";

const emailRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Email
 *     description: Envío de correos electrónicos
 */

/**
 * @swagger
 * /email/send:
 *   post:
 *     tags: [Email]
 *     summary: Enviar un correo electrónico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       200:
 *         description: Correo enviado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accepted:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user@example.com"]
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno al enviar el correo
 */
emailRouter.post("/send", validateSchema(emailSchema), sendMailEth);

export default emailRouter;


