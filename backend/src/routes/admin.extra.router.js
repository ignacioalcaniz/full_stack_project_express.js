// src/routes/admin.extra.router.js
import { Router } from "express";
import multer from "multer";
import { checkRole } from "../Middlewares/check.role.js";
import * as AdminExtraController from "../controllers/admin.extra.controller.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// 🔒 todas requieren admin
router.use(checkRole("admin"));

/** ===== Exportaciones ===== **/
router.get("/export/products", AdminExtraController.exportProducts);
router.get("/export/users", AdminExtraController.exportUsers);
router.get("/export/sales", AdminExtraController.exportSales);

/** ===== Acciones masivas ===== **/
router.post("/bulk/update-prices", AdminExtraController.bulkUpdatePrices);
router.post("/bulk/delete-inactive-users", AdminExtraController.deleteInactiveUsers);

/** ===== Importaciones ===== **/
router.post("/import/products", upload.single("file"), AdminExtraController.importProductsCsv);

export default router;
