// src/routes/admin.logs.router.js
import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { requirePermission } from "../Middlewares/requirePermission.js";
import * as LogsController from "../controllers/admin.logs.controller.js";

const router = Router();

router.use(passportCall("jwt", { session: false }));
router.use(checkRole(["admin", "support"])); // logs suele ser admin/support
router.get("/", requirePermission("logs:read"), LogsController.getLogs);
router.get("/export", requirePermission("logs:export"), LogsController.exportLogs);

export default router;

