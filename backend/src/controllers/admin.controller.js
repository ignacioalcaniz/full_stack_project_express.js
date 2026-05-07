// src/controllers/admin.controller.js
import { adminServices } from "../services/admin.services.js";
import { createResponse } from "../utils/user.utils.js";

export const adminController = {
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

      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const result = await adminServices.updateUserRole(uid, role, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("dashboard:changed", {
          type: "user_role_updated",
          userId: uid,
          role,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { uid } = req.params;

      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const result = await adminServices.deleteUser(uid, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("dashboard:changed", {
          type: "user_deleted",
          userId: uid,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async getAllProducts(req, res, next) {
    try {
      const { page, limit, q, categoria } = req.query;
      const products = await adminServices.getAllProducts({ page, limit, q, categoria });
      createResponse(res, 200, products);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req, res, next) {
    try {
      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const product = await adminServices.createProduct(req.body, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("products:changed", {
          type: "created",
          productId: product?._id || null,
          product,
          at: new Date().toISOString(),
        });

        io.emit("dashboard:changed", {
          type: "product_created",
          productId: product?._id || null,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 201, product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { pid } = req.params;

      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const product = await adminServices.updateProduct(pid, req.body, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("products:changed", {
          type: "updated",
          productId: pid,
          product,
          at: new Date().toISOString(),
        });

        io.emit("dashboard:changed", {
          type: "product_updated",
          productId: pid,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 200, product);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { pid } = req.params;

      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const result = await adminServices.deleteProduct(pid, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("products:changed", {
          type: "deleted",
          productId: pid,
          at: new Date().toISOString(),
        });

        io.emit("dashboard:changed", {
          type: "product_deleted",
          productId: pid,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async getAllTickets(req, res, next) {
    try {
      const { page, limit, purchaser, dateFrom, dateTo } = req.query;
      const tickets = await adminServices.getAllTickets({ page, limit, purchaser, dateFrom, dateTo });
      createResponse(res, 200, tickets);
    } catch (error) {
      next(error);
    }
  },

  async confirmTicketPayment(req, res, next) {
    try {
      const { tid } = req.params;

      const ctx = {
        adminId: req.user?._id,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
      };

      const result = await adminServices.confirmTicketPayment(tid, ctx);

      const io = req.app.get("io");
      if (io) {
        io.emit("dashboard:changed", {
          type: "ticket_payment_confirmed",
          ticketId: tid,
          at: new Date().toISOString(),
        });

        io.emit("products:changed", {
          type: "stock_updated_after_payment",
          ticketId: tid,
          at: new Date().toISOString(),
        });
      }

      createResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async getSalesReport(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      const report = await adminServices.getSalesReport({ dateFrom, dateTo });

      res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(report.data);
    } catch (error) {
      next(error);
    }
  },

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

