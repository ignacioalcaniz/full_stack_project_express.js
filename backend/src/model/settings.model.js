// src/model/settings.model.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    passwordPolicy: { type: String, default: "medium" }, // weak, medium, strong
    inactiveUserDays: { type: Number, default: 90 },
    rateLimitMax: { type: Number, default: 100 },
    externalIntegrations: {
      whatsappWebhook: { type: String, default: "" },
      emailProvider: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model("Settings", settingsSchema);
