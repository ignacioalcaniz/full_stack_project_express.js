// src/routes/chatbot.router.js
import { Router } from "express";
import { checkRole } from "../Middlewares/check.role.js";
import * as ChatbotController from "../controllers/chatbot.controller.js";

const router = Router();

/**
 * @swagger
 * /chatbot/ask:
 *   post:
 *     summary: Enviar una pregunta al chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               via:
 *                 type: string
 *                 enum: [web, whatsapp]
 */
router.post("/ask", ChatbotController.askQuestion);

router.post("/send", checkRole("admin"), ChatbotController.sendWhatsApp);
router.get("/faq", checkRole("admin"), ChatbotController.listFaq);
router.post("/faq", checkRole("admin"), ChatbotController.createFaq);
router.delete("/faq/:id", checkRole("admin"), ChatbotController.deleteFaq);

export default router;
