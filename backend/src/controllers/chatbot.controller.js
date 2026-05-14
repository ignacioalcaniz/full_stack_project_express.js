// src/controllers/chatbot.controller.js
import * as ChatbotService from "../services/chatbot.services.js";
import { TicketModel } from "../model/ticket.model.js";
import mongoose from "mongoose";
import { createResponse } from "../utils/user.utils.js";

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Preguntas generales, FAQs, pedidos y WhatsApp
 */

// ============================================================
// 1) Pregunta principal del chatbot
// ============================================================
export const askQuestion = async (req, res, next) => {
  try {
    const { question, via } = req.body;
    const userId = req.user?._id || null;

    const answer = await ChatbotService.getAnswer(question, userId, via);

    return createResponse(res, 200, {
      question,
      answer,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 2) Consultar pedidos del usuario autenticado
// ============================================================
export const askOrders = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return createResponse(res, 401, {
        error: "Necesitás estar logueado para ver tus pedidos.",
      });
    }

    const orders = await TicketModel.find({
      purchaser: new mongoose.Types.ObjectId(userId),
    })
      .sort({ purchase_datetime: -1 })
      .limit(5)
      .lean();

    return createResponse(res, 200, { orders });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 3) WhatsApp (solo admins)
// ============================================================
export const sendWhatsApp = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    const result = await ChatbotService.sendWhatsAppMessage(to, message);

    return createResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 4) Crear FAQ (solo admins)
// ============================================================
export const createFaq = async (req, res, next) => {
  try {
    const faq = await ChatbotService.createFaq(req.body);
    return createResponse(res, 201, faq);
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 5) Listar FAQs
// ============================================================
export const listFaq = async (_req, res, next) => {
  try {
    const faqs = await ChatbotService.listFaq();
    return createResponse(res, 200, faqs);
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 6) Eliminar FAQ (lo dejo 200 para mantener { data: ... })
// ============================================================
export const deleteFaq = async (req, res, next) => {
  try {
    const result = await ChatbotService.deleteFaq(req.params.id);
    return createResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};


