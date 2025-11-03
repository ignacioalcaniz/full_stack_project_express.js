// src/routes/admin.settings.router.js
import { Router } from "express";
import { checkRole } from "../Middlewares/check.role.js";
import * as SettingsController from "../controllers/admin.settings.controller.js";

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Configuración del sistema
 */
const router = Router();

router.use(checkRole("admin"));
router.get("/", SettingsController.getSettings);
router.put("/", SettingsController.updateSettings);

export default router;
