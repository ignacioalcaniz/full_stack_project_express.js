// src/middlewares/settings.attach.js
import { getCachedSettings } from "../services/settings.cache.js";

export async function attachSettings(req, _res, next) {
  try {
    req.settings = await getCachedSettings();
    next();
  } catch (e) {
    req.settings = null;
    next();
  }
}