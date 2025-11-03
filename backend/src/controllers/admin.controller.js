// src/controllers/admin.controller.js
import { adminServices } from "../services/admin.services.js";
import { createResponse } from "../utils/user.utils.js";

export const adminController = {
  // -----------------------------
  // 👤 USUARIOS
  // -----------------------------
  async getAllUsers(req, res, next) {
    try {
      const { page, limit, q, role } = req.query;
      const users = await adminServices.getAllUsers({ page, limit, q, role });
      createResponse(res, 200, users);
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { uid } = req.params;
      const { role } = req.body;
      const result = await adminServices.updateUserRole(uid, role, {
        adminId: req.user?._id,
        ip: req.ip,
      });
      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { uid } = req.params;
      const result = await adminServices.deleteUser(uid, {
        adminId: req.user?._id,
        ip: req.ip,
      });
      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------
  // 🛒 PRODUCTOS
  // -----------------------------
  async getAllProducts(req, res, next) {
    try {
      const { page, limit, q, categoria } = req.query;
      const products = await adminServices.getAllProducts({
        page,
        limit,
        q,
        categoria,
      });
      createResponse(res, 200, products);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req, res, next) {
    try {
      const product = await adminServices.createProduct(req.body, {
        adminId: req.user?._id,
        ip: req.ip,
      });
      createResponse(res, 201, product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { pid } = req.params;
      const product = await adminServices.updateProduct(pid, req.body, {
        adminId: req.user?._id,
        ip: req.ip,
      });
      createResponse(res, 200, product);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { pid } = req.params;
      const result = await adminServices.deleteProduct(pid, {
        adminId: req.user?._id,
        ip: req.ip,
      });
      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------
  // 🎫 TICKETS (VENTAS)
  // -----------------------------
  async getAllTickets(req, res, next) {
    try {
      const { page, limit, purchaser, dateFrom, dateTo } = req.query;
      const tickets = await adminServices.getAllTickets({
        page,
        limit,
        purchaser,
        dateFrom,
        dateTo,
      });
      createResponse(res, 200, tickets);
    } catch (error) {
      next(error);
    }
  },

  async getSalesReport(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      const report = await adminServices.getSalesReport({ dateFrom, dateTo });

      // si querés descargarlo directamente desde backend:
      res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(report.data);
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------
  // 📊 DASHBOARD
  // -----------------------------
  async getDashboardStats(req, res, next) {
    try {
      const { months } = req.query;
      const stats = await adminServices.getDashboardStats({ months });
      createResponse(res, 200, stats);
    } catch (error) {
      next(error);
    }
  },
};
