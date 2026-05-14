import { Router } from "express";
import multer from "multer";
import { checkRole } from "../Middlewares/check.role.js";
import * as AdminExtraController from "../controllers/admin.extra.controller.js";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.use(checkRole("admin"));

router.get("/export/products", AdminExtraController.exportProducts);
router.get("/export/users", AdminExtraController.exportUsers);
router.get("/export/sales", AdminExtraController.exportSales);

router.post("/bulk/update-prices", AdminExtraController.bulkUpdatePrices);
router.post(
  "/bulk/delete-inactive-users",
  AdminExtraController.deleteInactiveUsers
);

router.post(
  "/import/products",
  upload.single("file"),
  AdminExtraController.importProductsCsv
);

export default router;
