import { AdminLogModel } from "../model/adminLog.model.js";
import { buildPdfStream } from "../utils/pdf.util.js";
import { PassThrough } from "stream";

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function toCsvRow(vals) {
  return vals.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",");
}

export async function logAdminAction({
  adminId,
  action,
  method,
  route,
  ip,
  userAgent,
  statusCode,
  durationMs,
  details = {},
}) {
  return await AdminLogModel.create({
    adminId: adminId || undefined,
    action,
    method,
    route,
    ip,
    userAgent,
    statusCode: Number(statusCode) || 0,
    durationMs: Number(durationMs) || 0,
    details,
  });
}

function buildQuery({ adminId, action, from, to, q, statusCode }) {
  const query = {};

  if (adminId) query.adminId = adminId;
  if (action) query.action = { $regex: action, $options: "i" };
  if (q) {
    query.$or = [
      { action: { $regex: q, $options: "i" } },
      { route: { $regex: q, $options: "i" } },
      { method: { $regex: q, $options: "i" } },
      { ip: { $regex: q, $options: "i" } },
    ];
  }
  if (statusCode) query.statusCode = Number(statusCode);

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  return query;
}

export async function listLogs({
  adminId,
  from,
  to,
  action,
  q,
  statusCode,
  page = 1,
  limit = 25,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(10, Number(limit) || 25));

  const query = buildQuery({ adminId, from, to, action, q, statusCode });

  const [items, total] = await Promise.all([
    AdminLogModel.find(query)
      .populate("adminId", "email role")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    AdminLogModel.countDocuments(query),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit) || 1,
  };
}

export async function exportLogs({
  format = "csv",
  adminId,
  from,
  to,
  action,
  q,
  statusCode,
} = {}) {
  const query = buildQuery({ adminId, from, to, action, q, statusCode });

  const logs = await AdminLogModel.find(query)
    .populate("adminId", "email role")
    .sort({ createdAt: -1 })
    .lean();

  const columns = ["createdAt", "admin", "role", "action", "method", "route", "statusCode", "ip", "durationMs"];
  const rows = logs.map((l) => [
    l.createdAt ? new Date(l.createdAt).toISOString() : "",
    l.adminId?.email || "",
    l.adminId?.role || "",
    l.action || "",
    l.method || "",
    l.route || "",
    l.statusCode ?? "",
    l.ip || "",
    l.durationMs ?? "",
  ]);

  if (format === "pdf") {
    const pdf = await buildPdfStream({ title: "Admin Logs", columns, rows });
    return {
      filename: `admin_logs_${nowStamp()}.pdf`,
      contentType: "application/pdf",
      stream: pdf,
    };
  }

  const pass = new PassThrough();
  queueMicrotask(() => {
    pass.write(toCsvRow(columns) + "\n");
    for (const row of rows) pass.write(toCsvRow(row) + "\n");
    pass.end();
  });

  return {
    filename: `admin_logs_${nowStamp()}.csv`,
    contentType: "text/csv",
    stream: pass,
  };
}
