import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema(
  {
    user: { type: String, default: "anon" },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    from: { type: String, enum: ["web", "whatsapp"], default: "web" },
  },
  { timestamps: true }
);


export const ChatLogModel =
  mongoose.models.ChatLog || mongoose.model("ChatLog", chatLogSchema);

