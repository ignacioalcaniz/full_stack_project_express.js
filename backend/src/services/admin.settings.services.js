// src/services/admin.settings.services.js
import { SettingsModel } from "../model/settings.model.js";

export async function getSettings() {
  const s = await SettingsModel.findOne();
  if (!s) return await SettingsModel.create({});
  return s;
}

export async function updateSettings(data) {
  const settings = await getSettings();
  Object.assign(settings, data);
  await settings.save();
  return settings;
}
