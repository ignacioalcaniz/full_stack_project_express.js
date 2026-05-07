// src/model/chatbot.model.js
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, unique: true, trim: true },
    answer: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const FaqModel = mongoose.models.Faq || mongoose.model("Faq", faqSchema);

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    via: { type: String, enum: ["web", "whatsapp"], default: "web" },

    // ✅ extras pro (sirven para panel/admin)
    intent: { type: String, default: null },
    confidence: { type: Number, min: 0, max: 1, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Índices útiles
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ userId: 1, createdAt: -1 });
chatLogSchema.index({ via: 1, createdAt: -1 });

export const ChatLogModel =
  mongoose.models.ChatLog || mongoose.model("ChatLog", chatLogSchema);

