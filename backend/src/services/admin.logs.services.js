// src/services/admin.logs.services.js
import { AdminLogModel } from "../model/adminLog.model.js";
import { buildPdfStream } from "../utils/pdf.util.js";
import { PassThrough } from "stream";

function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}_${d.getHours()}${d.getMinutes()}`;
}

function toCsvRow(vals) {
  return vals.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",");
}

export async function logAdminAction({ adminId, action, method, route, ip, details = {} }) {
  return await AdminLogModel.create({ adminId, action, method, route, ip, details });
}

export async function listLogs({ adminId, from, to, action }) {
  const query = {};
  if (adminId) query.adminId = adminId;
  if (action) query.action = { $regex: action, $options: "i" };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  return await AdminLogModel.find(query).populate("adminId", "email role").sort({ createdAt: -1 }).lean();
}

export async function exportLogs(format = "csv") {
  const logs = await AdminLogModel.find().populate("adminId", "email").lean();
  const columns = ["admin", "action", "method", "route", "ip", "createdAt"];
  const rows = logs.map((l) => [
    l.adminId?.email,
    l.action,
    l.method,
    l.route,
    l.ip,
    l.createdAt.toISOString(),
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
