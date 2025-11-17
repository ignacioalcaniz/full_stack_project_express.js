// src/services/admin.services.js
import { userDaoMongo } from "../daos/user.dao.js";
import { productDaoMongo } from "../daos/product.dao.js";
import { ticketDaoMongo } from "../daos/ticket.dao.js";
import { AdminLogModel } from "../model/adminLog.model.js";
import { toCSV } from "../utils/csv.util.js";
import { CustomError } from "../utils/error.custom.js";

// Pequeño helper para logs (no rompe si no enviás req.user desde el middleware)
async function logAdminAction({ adminId, action, meta = {}, ip = "unknown" }) {
  try {
    await AdminLogModel.create({
      admin: adminId || null,
      action,
      meta,
      ip,
    });
  } catch {
    // no interrumpe el flujo si falla el log
  }
}

export const adminServices = {
  // -----------------------------
  // 👤 USUARIOS
  // -----------------------------
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

    // Si tu UserDao no tiene paginate, usamos el método base
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      userDaoMongo.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      userDaoMongo.model.countDocuments(filter),
    ]);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    };
  },

  async updateUserRole(uid, role, ctx = {}) {
    const validRoles = ["user", "admin", "premium"];
    if (!validRoles.includes(role)) {
      throw new CustomError("Rol inválido", 400);
    }
    const updated = await userDaoMongo.model.findByIdAndUpdate(
      uid,
      { role },
      { new: true }
    ).lean();

    if (!updated) throw new CustomError("Usuario no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "user.role.update",
      meta: { uid, role },
      ip: ctx.ip,
    });

    return updated;
  },

  async deleteUser(uid, ctx = {}) {
    const deleted = await userDaoMongo.model.findByIdAndDelete(uid).lean();
    if (!deleted) throw new CustomError("Usuario no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "user.delete",
      meta: { uid },
      ip: ctx.ip,
    });

    return { ok: true, uid };
  },

  // -----------------------------
  // 🛒 PRODUCTOS
  // -----------------------------
  async getAllProducts({ page = 1, limit = 20, q = "", categoria } = {}) {
    const filter = {};
    if (q) {
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
      ];
    }
    if (categoria) filter.categoria = categoria;

    // Si usás mongoose-paginate-v2 en el modelo, podés reemplazar por productDaoMongo.model.paginate
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      productDaoMongo.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      productDaoMongo.model.countDocuments(filter),
    ]);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    };
  },

  async createProduct(data, ctx = {}) {
    // Campos mínimos razonables (no rompe modelos existentes)
    const toCreate = {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: Number(data.precio ?? 0),
      stock: Number(data.stock ?? 0),
      categoria: data.categoria || "general",
      imagen: data.imagen || null,
      ...data, // por si tu modelo tiene campos adicionales
    };

    const created = await productDaoMongo.model.create(toCreate);
    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.create",
      meta: { pid: created._id },
      ip: ctx.ip,
    });
    return created.toObject ? created.toObject() : created;
  },

  async updateProduct(pid, data, ctx = {}) {
    const toUpdate = {
      ...data,
    };
    if ("precio" in data) toUpdate.precio = Number(data.precio);
    if ("stock" in data) toUpdate.stock = Number(data.stock);

    const updated = await productDaoMongo.model.findByIdAndUpdate(
      pid,
      toUpdate,
      { new: true }
    ).lean();

    if (!updated) throw new CustomError("Producto no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.update",
      meta: { pid, fields: Object.keys(data) },
      ip: ctx.ip,
    });

    return updated;
  },

  async deleteProduct(pid, ctx = {}) {
    const deleted = await productDaoMongo.model.findByIdAndDelete(pid).lean();
    if (!deleted) throw new CustomError("Producto no encontrado", 404);

    await logAdminAction({
      adminId: ctx.adminId,
      action: "product.delete",
      meta: { pid },
      ip: ctx.ip,
    });

    return { ok: true, pid };
  },

  // -----------------------------
  // 🎫 TICKETS (VENTAS)
  // -----------------------------
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
      ticketDaoMongo.model.find(filter).sort({ purchase_datetime: -1 }).skip(skip).limit(Number(limit)).lean(),
      ticketDaoMongo.model.countDocuments(filter),
    ]);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    };
  },

  // Reporte CSV simple (ventas por ticket)
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

    // Estructura CSV: code, purchaser, purchase_datetime, amount
    const rows = tickets.map(t => ({
      code: t.code,
      purchaser: t.purchaser,
      purchase_datetime: new Date(t.purchase_datetime).toISOString(),
      amount: t.amount,
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

  // -----------------------------
  // 📊 DASHBOARD (KPIs)
  // -----------------------------
  async getDashboardStats({ months = 6 } = {}) {
    // 1) Ventas por mes (últimos N meses)
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - (Number(months) - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const byMonth = await ticketDaoMongo.model.aggregate([
      { $match: { purchase_datetime: { $gte: start } } },
      {
        $group: {
          _id: { y: { $year: "$purchase_datetime" }, m: { $month: "$purchase_datetime" } },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    const salesByMonth = byMonth.map(x => ({
      year: x._id.y,
      month: x._id.m,
      totalAmount: x.totalAmount,
      count: x.count,
    }));

    // 2) Top productos (por tickets.products[].quantity)
    const topProducts = await ticketDaoMongo.model.aggregate([
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

    // 3) Stock bajo (alertas)
    const lowStock = await productDaoMongo.model
      .find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(20)
      .lean();

    // 4) Usuarios activos (últimos 30 días por last_login si existe)
    let activeUsers = 0;
    try {
      activeUsers = await userDaoMongo.model.countDocuments({
        last_login: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
    } catch {
      // si tu modelo no tiene last_login, lo reportamos como 0 sin romper
      activeUsers = 0;
    }

    return {
      salesByMonth,
      topProducts,
      lowStock,
      activeUsers,
    };
  },
};
