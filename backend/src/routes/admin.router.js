import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { checkRole } from "../Middlewares/check.role.js";

const router = Router();

// Rutas protegidas para administradores
router.use(checkRole("admin"));

// 👤 Usuarios
router.get("/users", adminController.getAllUsers);
router.put("/users/:uid/role", adminController.updateUserRole);
router.delete("/users/:uid", adminController.deleteUser);

// 🛒 Productos
router.get("/products", adminController.getAllProducts);
router.post("/products", adminController.createProduct);
router.put("/products/:pid", adminController.updateProduct);
router.delete("/products/:pid", adminController.deleteProduct);

// 💸 Tickets
router.get("/tickets", adminController.getAllTickets);
router.get("/tickets/report", adminController.getSalesReport);

// 📊 Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

export default router;
