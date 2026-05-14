// src/routes/admin.chatbot.router.js
import { Router } from "express";
import { checkRole } from "../Middlewares/check.role.js";
import { adminChatbotController } from "../controllers/admin.chatbot.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Chatbot
 *   description: Panel administrativo del Chatbot (FAQs, Logs, Stats)
 */

router.use(checkRole("admin"));

/**
 * @swagger
 * /admin/chatbot/faqs:
 *   get:
 *     summary: Listar FAQs del chatbot
 *     tags: [Admin Chatbot]
 */
router.get("/faqs", adminChatbotController.listFaqs);

/**
 * @swagger
 * /admin/chatbot/faqs:
 *   post:
 *     summary: Crear FAQ del chatbot
 *     tags: [Admin Chatbot]
 */
router.post("/faqs", adminChatbotController.createFaq);

/**
 * @swagger
 * /admin/chatbot/faqs/{id}:
 *   put:
 *     summary: Actualizar FAQ del chatbot
 *     tags: [Admin Chatbot]
 */
router.put("/faqs/:id", adminChatbotController.updateFaq);

/**
 * @swagger
 * /admin/chatbot/faqs/{id}:
 *   delete:
 *     summary: Eliminar FAQ del chatbot
 *     tags: [Admin Chatbot]
 */
router.delete("/faqs/:id", adminChatbotController.deleteFaq);

/**
 * @swagger
 * /admin/chatbot/logs:
 *   get:
 *     summary: Listar logs del chatbot con filtros
 *     tags: [Admin Chatbot]
 */
router.get("/logs", adminChatbotController.listLogs);

/**
 * @swagger
 * /admin/chatbot/logs/export:
 *   get:
 *     summary: Exportar logs del chatbot (csv/pdf)
 *     tags: [Admin Chatbot]
 */
router.get("/logs/export", adminChatbotController.exportLogs);

/**
 * @swagger
 * /admin/chatbot/stats:
 *   get:
 *     summary: Métricas del chatbot (mensajes por día, top preguntas, etc.)
 *     tags: [Admin Chatbot]
 */
router.get("/stats", adminChatbotController.getStats);

export default router;

