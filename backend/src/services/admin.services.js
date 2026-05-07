// src/services/admin.services.js
import { userDaoMongo } from "../daos/user.dao.js";
import { productDaoMongo } from "../daos/product.dao.js";
import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { AdminLogModel } from "../model/adminLog.model.js";
import { ProductModel } from "../model/product.model.js";
import { toCSV } from "../utils/csv.util.js";
import { CustomError } from "../utils/error.custom.js";

async function logAdminAction({
  adminId,
  action,
  method,
  route,
  ip = "unknown",
  details = {},
}) {
  try {
    if (!adminId) return;
    await AdminLogModel.create({
      adminId,
      action,
      method,
      route,
      ip,
      details,
    });
  } catch {
    // no cortamos flujo si falla el log
  }
}

export const adminServices = {
  async getAllUsers({ page = 1, limit = 20, q = "", role } = {}) {
    const filter = {};
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: "i" } },
        { first_name: { $regex: q, $options: "i" } },
        { last_name: { $regex: q, $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      userDaoMongo.model
        .find(filter, "-password -refreshTokens -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      userDaoMongo.model.countDocuments(filter),
    ]);

    return { page: Number(page), limit: Number(limit), total, items };
  },

  async updateUserRole(uid, role, ctx = {}) {
    const validRoles = ["user", "premium", "admin", "support", "catalog", "finance"];
    if (!validRoles.includes(role)) throw new CustomError("Rol inválido", 400);

    const updated = await userDaoMongo.model
      .findByIdAndUpdate(uid, { role }, { new: true })
      .select("-password -refreshTokens -__v")
      .lean();

    if (!updated) throw new CustomError("Usuario no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "user.role.update",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { uid, role },
    });

    return updated;
  },

  async deleteUser(uid, ctx = {}) {
    const deleted = await userDaoMongo.model.findByIdAndDelete(uid).lean();
    if (!deleted) throw new CustomError("Usuario no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "user.delete",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { uid },
    });

    return { ok: true, uid };
  },

  async getAllProducts({ page = 1, limit = 20, q = "", categoria } = {}) {
    const filter = {};
    if (q) {
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
      ];
    }
    if (categoria) filter.categoria = categoria;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      productDaoMongo.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      productDaoMongo.model.countDocuments(filter),
    ]);

    return { page: Number(page), limit: Number(limit), total, items };
  },

  async createProduct(data, ctx = {}) {
    const toCreate = {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: Number(data.precio ?? 0),
      stock: Number(data.stock ?? 0),
      categoria: data.categoria || "general",
      imagen: data.imagen || null,
      ...data,
    };

    const created = await productDaoMongo.model.create(toCreate);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.create",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { pid: created._id },
    });

    return created.toObject ? created.toObject() : created;
  },

  async updateProduct(pid, data, ctx = {}) {
    const toUpdate = { ...data };
    if ("precio" in data) toUpdate.precio = Number(data.precio);
    if ("stock" in data) toUpdate.stock = Number(data.stock);

    const updated = await productDaoMongo.model
      .findByIdAndUpdate(pid, toUpdate, { new: true })
      .lean();

    if (!updated) throw new CustomError("Producto no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.update",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { pid, fields: Object.keys(data) },
    });

    return updated;
  },

  async deleteProduct(pid, ctx = {}) {
    const deleted = await productDaoMongo.model.findByIdAndDelete(pid).lean();
    if (!deleted) throw new CustomError("Producto no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.delete",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { pid },
    });

    return { ok: true, pid };
  },

  async getAllTickets({ page = 1, limit = 20, purchaser, dateFrom, dateTo } = {}) {
    const filter = {};
    if (purchaser) filter.purchaser = { $regex: purchaser, $options: "i" };
    if (dateFrom || dateTo) {
      filter.purchase_datetime = {};
      if (dateFrom) filter.purchase_datetime.$gte = new Date(dateFrom);
      if (dateTo) filter.purchase_datetime.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      ticketDaoMongo.model
        .find(filter)
        .sort({ purchase_datetime: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ticketDaoMongo.model.countDocuments(filter),
    ]);

    return { page: Number(page), limit: Number(limit), total, items };
  },

  async confirmTicketPayment(tid, ctx = {}) {
    const ticket = await ticketDaoMongo.model.findById(tid);
    if (!ticket) throw new CustomError("Ticket no encontrado", 404);

    if (ticket.paymentStatus === "paid") {
      return ticket.toObject ? ticket.toObject() : ticket;
    }

    if (!["transfer", "cash"].includes(ticket.paymentMethod)) {
      throw new CustomError(
        "Solo se puede confirmar manualmente transferencia o efectivo",
        400
      );
    }

    for (const item of ticket.products || []) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        throw new CustomError(
          `Producto no encontrado para confirmar ticket: ${item.title}`,
          404
        );
      }

      if (Number(product.stock || 0) < Number(item.quantity || 0)) {
        throw new CustomError(
          `Stock insuficiente para confirmar el pago de "${item.title}"`,
          400
        );
      }
    }

    for (const item of ticket.products || []) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: -Number(item.quantity || 0),
          "stats.purchases": Number(item.quantity || 0),
        },
      });
    }

    ticket.paymentStatus = "paid";
    ticket.status = "completed";
    ticket.paymentConfirmedAt = new Date();
    ticket.paymentConfirmedBy = ctx.adminId || null;

    await ticket.save();

    await logAdminAction({
      adminId: ctx.adminId,
      action: "ticket.payment.confirm",
      method: ctx.method,
      route: ctx.route,
      ip: ctx.ip,
      details: { tid },
    });

    return ticket.toObject ? ticket.toObject() : ticket;
  },

  async getSalesReport({ dateFrom, dateTo } = {}) {
    const filter = {};
    if (dateFrom || dateTo) {
      filter.purchase_datetime = {};
      if (dateFrom) filter.purchase_datetime.$gte = new Date(dateFrom);
      if (dateTo) filter.purchase_datetime.$lte = new Date(dateTo);
    }

    const tickets = await ticketDaoMongo.model
      .find(filter)
      .sort({ purchase_datetime: -1 })
      .lean();

    const rows = tickets.map((t) => ({
      code: t.code,
      purchaser: t.purchaser,
      purchase_datetime: new Date(t.purchase_datetime).toISOString(),
      amount: t.amount,
      paymentMethod: t.paymentMethod || "card",
      paymentStatus: t.paymentStatus || "paid",
      status: t.status || "completed",
    }));

    const csv = toCSV(rows);

    return {
      filename: `sales_${Date.now()}.csv`,
      mime: "text/csv",
      data: csv,
      count: rows.length,
      totalAmount: tickets.reduce((acc, t) => acc + Number(t.amount || 0), 0),
    };
  },

  async getDashboardStats({ months = 6 } = {}) {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - (Number(months) - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const byMonth = await ticketDaoMongo.model.aggregate([
      { $match: { purchase_datetime: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year: "$purchase_datetime" },
            m: { $month: "$purchase_datetime" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    const salesByMonth = byMonth.map((x) => ({
      year: x._id.y,
      month: x._id.m,
      totalAmount: x.totalAmount,
      count: x.count,
    }));

    const topProducts = await ticketDaoMongo.model.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          title: { $first: "$products.title" },
          totalQty: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.subtotal" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    const lowStock = await productDaoMongo.model
      .find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(20)
      .lean();

    const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let activeUsers = 0;
    try {
      activeUsers = await userDaoMongo.model.countDocuments({
        $or: [
          { lastLoginAt: { $gte: activeSince } },
          { last_login: { $gte: activeSince } }, // fallback legacy
        ],
      });
    } catch {
      activeUsers = 0;
    }

    return { salesByMonth, topProducts, lowStock, activeUsers };
  },
};


