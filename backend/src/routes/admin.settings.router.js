// src/routes/admin.settings.router.js
import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import * as SettingsController from "../controllers/admin.settings.controller.js";

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Configuración del sistema
 */
const router = Router();

// ✅ primero autenticación, después rol
router.use(passportCall("jwt"));
router.use(checkRole("admin"));

router.get("/", SettingsController.getSettings);
router.put("/", SettingsController.updateSettings);

export default router;
