// src/controllers/admin.settings.controller.js
import * as SettingsService from "../services/admin.settings.services.js";

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
    res.status(200).json(settings);
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
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
