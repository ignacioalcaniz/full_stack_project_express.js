// src/services/admin.settings.services.js
import { SettingsModel } from "../model/settings.model.js";
import { forceReloadSettings } from "./settings.cache.js";

export async function getSettings() {
  let s = await SettingsModel.findOne();
  if (!s) s = await SettingsModel.create({});
  return s;
}

export async function updateSettings(data = {}) {
  const settings = await getSettings();

  // merge seguro (mantiene campos existentes)
  Object.assign(settings, data);

  await settings.save();

  // IMPORTANTÍSIMO: refresca cache para que impacte al toque
  await forceReloadSettings();

  return settings;
}
