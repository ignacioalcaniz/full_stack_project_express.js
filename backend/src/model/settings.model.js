// src/model/settings.model.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },

    // weak | medium | strong
    passwordPolicy: {
      type: String,
      enum: ["weak", "medium", "strong"],
      default: "medium",
    },

    // días para considerar usuario inactivo
    inactiveUserDays: { type: Number, default: 90, min: 1, max: 3650 },

    // rate limit (requests) por ventana (depende tu middleware)
    rateLimitMax: { type: Number, default: 100, min: 10, max: 5000 },

    externalIntegrations: {
      whatsappWebhook: { type: String, default: "" },
      emailProvider: { type: String, default: "" },
    },
  },
  { timestamps: true, strict: true }
);

// ✅ evita "OverwriteModelError" en dev/hot reload
export const SettingsModel =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
