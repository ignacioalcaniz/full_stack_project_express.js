// src/services/settings.cache.js
import { SettingsModel } from "../model/settings.model.js";

let cache = null;
let lastLoad = 0;

export async function getCachedSettings({ ttlMs = 10_000 } = {}) {
  const now = Date.now();
  if (cache && now - lastLoad < ttlMs) return cache;

  let s = await SettingsModel.findOne().lean();
  if (!s) {
    const created = await SettingsModel.create({});
    s = created.toObject();
  }

  cache = s;
  lastLoad = now;
  return cache;
}

export async function forceReloadSettings() {
  cache = null;
  return await getCachedSettings({ ttlMs: 0 });
}