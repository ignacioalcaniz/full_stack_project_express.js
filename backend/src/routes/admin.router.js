// src/routes/admin.router.js
import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { requirePermission } from "../Middlewares/requirePermission.js";

const router = Router();

router.use(passportCall("jwt", { session: false }));
router.use(checkRole(["admin", "support", "catalog", "finance"]));

// 👤 Usuarios
router.get("/users", requirePermission("users:read"), adminController.getAllUsers);
router.put("/users/:uid/role", requirePermission("users:write"), adminController.updateUserRole);
router.delete("/users/:uid", requirePermission("users:write"), adminController.deleteUser);

// 🛒 Productos
router.get("/products", requirePermission("products:read"), adminController.getAllProducts);
router.post("/products", requirePermission("products:write"), adminController.createProduct);
router.put("/products/:pid", requirePermission("products:write"), adminController.updateProduct);
router.delete("/products/:pid", requirePermission("products:write"), adminController.deleteProduct);

// 💸 Tickets
router.get("/tickets", requirePermission("tickets:read"), adminController.getAllTickets);
router.get("/tickets/report", requirePermission("reports:export"), adminController.getSalesReport);
router.patch(
  "/tickets/:tid/confirm-payment",
  requirePermission("tickets:write"),
  adminController.confirmTicketPayment
);

// 📊 Dashboard
router.get("/dashboard/stats", requirePermission("dashboard:read"), adminController.getDashboardStats);

export default router;

