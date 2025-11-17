// src/controllers/chatbot.controller.js
import * as ChatbotService from "../services/chatbot.services.js";

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Preguntas generales y WhatsApp
 */

export const askQuestion = async (req, res, next) => {
  try {
    const { question, via } = req.body;
    const userId = req.user?._id || null;
    const answer = await ChatbotService.getAnswer(question, userId, via);
    res.status(200).json({ question, answer });
  } catch (err) {
    next(err);
  }
};

export const sendWhatsApp = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    const sid = await ChatbotService.sendWhatsAppMessage(to, message);
    res.status(200).json({ sid });
  } catch (err) {
    next(err);
  }
};

// CRUD FAQ
export const createFaq = async (req, res, next) => {
  try {
    const faq = await ChatbotService.createFaq(req.body);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

export const listFaq = async (_req, res, next) => {
  try {
    const faqs = await ChatbotService.listFaq();
    res.status(200).json(faqs);
  } catch (err) {
    next(err);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    await ChatbotService.deleteFaq(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
