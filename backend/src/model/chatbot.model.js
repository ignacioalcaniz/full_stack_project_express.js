// src/model/chatbot.model.js
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  tags: [String],
});

export const FaqModel = mongoose.model("Faq", faqSchema);

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    question: { type: String, required: true },
    answer: { type: String },
    via: { type: String, enum: ["web", "whatsapp"], default: "web" },
  },
  { timestamps: true }
);

export const ChatLogModel = mongoose.model("ChatLog", chatLogSchema);
