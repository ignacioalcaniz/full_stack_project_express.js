// src/controllers/admin.chatbot.controller.js
import { adminChatbotServices } from "../services/admin.chatbot.services.js";
import { createResponse } from "../utils/user.utils.js";
import { logAdminAction } from "../services/admin.logs.services.js";

function ctxFromReq(req) {
  return {
    adminId: req.user?._id,
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
  };
}

export const adminChatbotController = {
  /* ---------- FAQs ---------- */
  async listFaqs(req, res, next) {
    try {
      const { q, tag } = req.query;
      const data = await adminChatbotServices.listFaqs({ q, tag });
      createResponse(res, 200, data);
    } catch (err) {
      next(err);
    }
  },

  async createFaq(req, res, next) {
    try {
      const { question, answer, tags } = req.body;

      const created = await adminChatbotServices.createFaq({
        question,
        answer,
        tags,
      });

      await logAdminAction({
        ...ctxFromReq(req),
        action: "chatbot.faq.create",
        details: { id: created._id, question: created.question },
      });

      createResponse(res, 201, created);
    } catch (err) {
      next(err);
    }
  },

  async updateFaq(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await adminChatbotServices.updateFaq(id, req.body);

      await logAdminAction({
        ...ctxFromReq(req),
        action: "chatbot.faq.update",
        details: { id, fields: Object.keys(req.body || {}) },
      });

      createResponse(res, 200, updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteFaq(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminChatbotServices.deleteFaq(id);

      await logAdminAction({
        ...ctxFromReq(req),
        action: "chatbot.faq.delete",
        details: { id },
      });

      createResponse(res, 200, result);
    } catch (err) {
      next(err);
    }
  },

  /* ---------- Logs ---------- */
  async listLogs(req, res, next) {
    try {
      const { page, limit, q, via, userId, from, to } = req.query;

      const data = await adminChatbotServices.listChatLogs({
        page,
        limit,
        q,
        via,
        userId,
        from,
        to,
      });

      createResponse(res, 200, data);
    } catch (err) {
      next(err);
    }
  },

  async exportLogs(req, res, next) {
    try {
      const format = req.query.format || "csv";
      const { q, via, userId, from, to } = req.query;

      const { filename, contentType, stream } =
        await adminChatbotServices.exportChatLogs(format, {
          q,
          via,
          userId,
          from,
          to,
        });

      await logAdminAction({
        ...ctxFromReq(req),
        action: "chatbot.logs.export",
        details: { format, q, via, userId, from, to },
      });

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", contentType);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  /* ---------- Stats ---------- */
  async getStats(req, res, next) {
    try {
      const { days } = req.query;
      const data = await adminChatbotServices.getChatbotStats({ days });
      createResponse(res, 200, data);
    } catch (err) {
      next(err);
    }
  },
};

