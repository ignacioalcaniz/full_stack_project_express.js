
import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    method: { type: String },
    route: { type: String },
    ip: { type: String },
    details: { type: Object },
  },
  { timestamps: true }
);

export const AdminLogModel = mongoose.model("AdminLog", adminLogSchema);
