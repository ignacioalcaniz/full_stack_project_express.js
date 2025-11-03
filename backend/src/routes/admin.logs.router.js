// src/routes/admin.logs.router.js
import { Router } from "express";
import { checkRole } from "../Middlewares/check.role.js";
import * as LogsController from "../controllers/admin.logs.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Logs
 *   description: Auditoría administrativa
 */
router.use(checkRole("admin"));
router.get("/", LogsController.getLogs);
router.get("/export", LogsController.exportLogs);

export default router;
