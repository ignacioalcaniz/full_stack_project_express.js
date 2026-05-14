import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    action: { type: String, required: true },

    method: { type: String, default: "GET" },
    route: { type: String, default: "" },

    statusCode: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },

    details: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const AdminLogModel =
  mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);


