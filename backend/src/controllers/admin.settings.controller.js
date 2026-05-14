// src/controllers/admin.settings.controller.js
import * as SettingsService from "../services/admin.settings.services.js";
import { createResponse } from "../utils/user.utils.js";

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Obtener configuración del sistema
 *     tags: [Admin Settings]
 */
export const getSettings = async (_req, res, next) => {
  try {
    const settings = await SettingsService.getSettings();
    return createResponse(res, 200, settings);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Actualizar configuración del sistema
 *     tags: [Admin Settings]
 */
export const updateSettings = async (req, res, next) => {
  try {
    const updated = await SettingsService.updateSettings(req.body);
    return createResponse(res, 200, updated);
  } catch (err) {
    next(err);
  }
};

