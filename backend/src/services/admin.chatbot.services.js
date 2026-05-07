// src/services/admin.chatbot.services.js
import { PassThrough } from "stream";
import mongoose from "mongoose";
import { FaqModel, ChatLogModel } from "../model/chatbot.model.js";
import { buildPdfStream } from "../utils/pdf.util.js";

/* =========================
   Helpers
========================= */
function toCsvRow(values) {
  return values
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(",");
}

function arrayToCsvStream(headers, rows) {
  const pass = new PassThrough();
  queueMicrotask(() => {
    pass.write(toCsvRow(headers) + "\n");
    for (const r of rows) pass.write(toCsvRow(r) + "\n");
    pass.end();
  });
  return pass;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(
    d.getHours()
  )}${pad(d.getMinutes())}`;
}

function parseDateOrNull(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeObjectId(v) {
  if (!v) return null;
  if (!mongoose.Types.ObjectId.isValid(v)) return null;
  return new mongoose.Types.ObjectId(v);
}

/* =========================
   Services
========================= */
export const adminChatbotServices = {
  /* ---------- FAQs ---------- */
  async listFaqs({ q = "", tag } = {}) {
    const filter = {};
    if (q) filter.question = { $regex: q, $options: "i" };
    if (tag) filter.tags = { $in: [String(tag)] };

    const items = await FaqModel.find(filter).sort({ updatedAt: -1 }).lean();
    return { total: items.length, items };
  },

  async createFaq({ question, answer, tags = [] }) {
    const doc = await FaqModel.create({
      question,
      answer,
      tags: Array.isArray(tags) ? tags : [],
    });
    return doc.toObject ? doc.toObject() : doc;
  },

  async updateFaq(id, { question, answer, tags }) {
    const patch = {};
    if (typeof question === "string") patch.question = question;
    if (typeof answer === "string") patch.answer = answer;
    if (tags !== undefined) patch.tags = Array.isArray(tags) ? tags : [];

    const updated = await FaqModel.findByIdAndUpdate(id, patch, {
      new: true,
    }).lean();

    if (!updated) {
      const err = new Error("FAQ no encontrada");
      err.statusCode = 404;
      throw err;
    }
    return updated;
  },

  async deleteFaq(id) {
    const deleted = await FaqModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      const err = new Error("FAQ no encontrada");
      err.statusCode = 404;
      throw err;
    }
    return { ok: true, id };
  },

  /* ---------- Logs / Chats ---------- */
  async listChatLogs({
    page = 1,
    limit = 20,
    q = "",
    via,
    userId,
    from,
    to,
  } = {}) {
    const filter = {};

    if (q) {
      filter.$or = [
        { question: { $regex: q, $options: "i" } },
        { answer: { $regex: q, $options: "i" } },
      ];
    }

    if (via) filter.via = via;

    const oid = safeObjectId(userId);
    if (userId && !oid) {
      const err = new Error("userId inválido");
      err.statusCode = 400;
      throw err;
    }
    if (oid) filter.userId = oid;

    const dFrom = parseDateOrNull(from);
    const dTo = parseDateOrNull(to);
    if (from && !dFrom) {
      const err = new Error("from inválido (fecha)");
      err.statusCode = 400;
      throw err;
    }
    if (to && !dTo) {
      const err = new Error("to inválido (fecha)");
      err.statusCode = 400;
      throw err;
    }
    if (dFrom || dTo) {
      filter.createdAt = {};
      if (dFrom) filter.createdAt.$gte = dFrom;
      if (dTo) filter.createdAt.$lte = dTo;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      ChatLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ChatLogModel.countDocuments(filter),
    ]);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    };
  },

  async exportChatLogs(
    format = "csv",
    { q = "", via, userId, from, to } = {}
  ) {
    const logs = await this.listChatLogs({
      page: 1,
      limit: 5000, // export razonable
      q,
      via,
      userId,
      from,
      to,
    });

    const columns = [
      "createdAt",
      "via",
      "userId",
      "question",
      "answer",
      "intent",
      "confidence",
    ];

    const rows = logs.items.map((l) => [
      l.createdAt?.toISOString?.() ?? String(l.createdAt),
      l.via ?? "",
      l.userId ?? "",
      l.question ?? "",
      l.answer ?? "",
      l.intent ?? "",
      l.confidence ?? "",
    ]);

    const stamp = nowStamp();

    if (format === "pdf") {
      const pdf = await buildPdfStream({
        title: "Chatbot Logs",
        columns,
        rows,
      });
      return {
        filename: `chatbot_logs_${stamp}.pdf`,
        contentType: "application/pdf",
        stream: pdf,
      };
    }

    return {
      filename: `chatbot_logs_${stamp}.csv`,
      contentType: "text/csv; charset=utf-8",
      stream: arrayToCsvStream(columns, rows),
    };
  },

  /* ---------- Métricas ---------- */
  async getChatbotStats({ days = 30 } = {}) {
    const n = Math.max(1, Math.min(365, Number(days) || 30));
    const start = new Date(Date.now() - n * 24 * 60 * 60 * 1000);

    const [byDay, viaBreakdown, topQuestions, total] = await Promise.all([
      ChatLogModel.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
      ]),
      ChatLogModel.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$via", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ChatLogModel.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$question", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ChatLogModel.countDocuments({ createdAt: { $gte: start } }),
    ]);

    return {
      rangeDays: n,
      totalMessages: total,
      messagesByDay: byDay.map((x) => ({
        date: `${x._id.y}-${String(x._id.m).padStart(2, "0")}-${String(
          x._id.d
        ).padStart(2, "0")}`,
        count: x.count,
      })),
      viaBreakdown: viaBreakdown.map((x) => ({
        via: x._id || "unknown",
        count: x.count,
      })),
      topQuestions: topQuestions.map((x) => ({
        question: x._id,
        count: x.count,
      })),
    };
  },
};

