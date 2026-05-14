// src/routes/chatbot.router.js
import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import * as ChatbotController from "../controllers/chatbot.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Preguntas generales, sugerencias y WhatsApp
 */

/**
 * @swagger
 * /chatbot/ask:
 *   post:
 *     summary: Enviar una pregunta al chatbot
 *     tags: [Chatbot]
 */
router.post("/ask", ChatbotController.askQuestion);

/**
 * @swagger
 * /chatbot/suggestions:
 *   get:
 *     summary: Obtener sugerencias automáticas
 *     tags: [Chatbot]
 */
router.get("/suggestions", (_req, res) => {
  res.status(200).json({
    items: [
      "¿Tenés Harry Potter?",
      "Recomendame un libro",
      "¿Cuánto tarda el envío?",
      "¿Puedo pagar con tarjeta?",
      "¿Dónde veo mis pedidos?",
      "Tengo un problema con una compra",
    ],
  });
});

/**
 * @swagger
 * /chatbot/orders:
 *   get:
 *     summary: Últimos pedidos del usuario autenticado
 *     tags: [Chatbot]
 */
router.get(
  "/orders",
  passportCall("jwt"),   // ✔ Usuario debe estar logueado
  ChatbotController.askOrders
);

/**
 * @swagger
 * /chatbot/send:
 *   post:
 *     summary: Enviar mensaje por WhatsApp
 *     tags: [Chatbot]
 */
router.post(
  "/send",
  passportCall("jwt"),   // ✔ Obligatorio estar logueado
  checkRole("admin"),    // ✔ Solo admin
  ChatbotController.sendWhatsApp
);

/**
 * @swagger
 * /chatbot/faq:
 *   get:
 *     summary: Listar FAQs del chatbot
 *     tags: [Chatbot]
 */
router.get(
  "/faq",
  passportCall("jwt"),
  checkRole("admin"),
  ChatbotController.listFaq
);

/**
 * @swagger
 * /chatbot/faq:
 *   post:
 *     summary: Crear una nueva FAQ
 *     tags: [Chatbot]
 */
router.post(
  "/faq",
  passportCall("jwt"),
  checkRole("admin"),
  ChatbotController.createFaq
);

/**
 * @swagger
 * /chatbot/faq/{id}:
 *   delete:
 *     summary: Eliminar FAQ
 *     tags: [Chatbot]
 */
router.delete(
  "/faq/:id",
  passportCall("jwt"),
  checkRole("admin"),
  ChatbotController.deleteFaq
);

export default router;


