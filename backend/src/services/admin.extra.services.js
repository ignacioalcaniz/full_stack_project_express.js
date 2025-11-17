// src/services/admin.extra.services.js
import fs from "node:fs";
import { Readable, PassThrough } from "node:stream";
import { ProductModel } from "../model/product.model.js";
import { UserModel } from "../model/user.model.js";
import { TicketModel } from "../model/ticket.model.js";
import { buildPdfStream } from "../utils/pdf.util.js";

// ====== helpers CSV sin dependencias ======
function toCsvRow(values) {
  return values
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      // escapado básico de comillas/delimitadores
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(",");
}

function arrayToCsvStream(headers, rows) {
  const pass = new PassThrough();
  // write head + rows async
  queueMicrotask(() => {
    pass.write(toCsvRow(headers) + "\n");
    for (const r of rows) pass.write(toCsvRow(r) + "\n");
    pass.end();
  });
  return pass;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function makePdfStream(title, columns, rows) {
  const doc = await buildPdfStream({ title, columns, rows });
  return doc; // ya es un stream legible
}

function pickFormats(format, baseName) {
  if (format === "pdf") {
    return { filename: `${baseName}_${nowStamp()}.pdf`, contentType: "application/pdf" };
  }
  return { filename: `${baseName}_${nowStamp()}.csv`, contentType: "text/csv; charset=utf-8" };
}

/** ================== EXPORTS ================== **/
export async function exportProducts(format = "csv") {
  const products = await ProductModel.find({}, "-__v").lean();

  const columns = ["_id", "nombre", "descripcion", "precio", "stock", "categoria", "imagen", "createdAt", "updatedAt"];
  const rows = products.map((p) => columns.map((c) => p[c] ?? ""));

  const meta = pickFormats(format, "products");
  const stream =
    format === "pdf"
      ? await makePdfStream("Productos", columns, rows)
      : arrayToCsvStream(columns, rows);

  return { ...meta, stream };
}

export async function exportUsers(format = "csv") {
  const users = await UserModel.find({}, "-password -__v").lean();

  const columns = [
    "_id",
    "email",
    "role",
    "first_name",
    "last_name",
    "age",
    "last_login_at",
    "createdAt",
    "updatedAt",
    "suspended",
  ];
  const rows = users.map((u) => columns.map((c) => u[c] ?? ""));

  const meta = pickFormats(format, "users");
  const stream =
    format === "pdf"
      ? await makePdfStream("Usuarios", columns, rows)
      : arrayToCsvStream(columns, rows);

  return { ...meta, stream };
}

export async function exportSales(format = "csv", { from, to } = {}) {
  const q = {};
  if (from || to) {
    q.purchase_datetime = {};
    if (from) q.purchase_datetime.$gte = new Date(from);
    if (to) q.purchase_datetime.$lte = new Date(to);
  }

  const tickets = await TicketModel.find(q, "-__v").lean();
  const columns = ["_id", "code", "purchase_datetime", "amount", "purchaser", "productsCount"];
  const rows = tickets.map((t) => [t._id, t.code, t.purchase_datetime?.toISOString?.() ?? t.purchase_datetime, t.amount, t.purchaser, t.products?.length ?? 0]);

  const meta = pickFormats(format, "sales");
  const stream =
    format === "pdf"
      ? await makePdfStream("Ventas", columns, rows)
      : arrayToCsvStream(columns, rows);

  return { ...meta, stream };
}

/** ================== BULK ACTIONS ================== **/
/**
 * payload:
 * {
 *   scope: 'all' | 'category' | 'ids',
 *   mode: 'percent' | 'absolute',    // percent=+/-%, absolute= set value
 *   value: number,                    // ej 10 => +10% ó 1999 => precio fijo
 *   category?: string,
 *   ids?: string[]
 * }
 */
export async function bulkUpdatePrices({ scope = "all", mode = "percent", value, category, ids } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("value debe ser un número.");
  }

  let filter = {};
  if (scope === "category") {
    if (!category) throw new Error("Debe indicar 'category' cuando scope='category'.");
    filter = { categoria: category };
  } else if (scope === "ids") {
    if (!Array.isArray(ids) || ids.length === 0) throw new Error("Debe indicar 'ids' cuando scope='ids'.");
    filter = { _id: { $in: ids } };
  }

  const products = await ProductModel.find(filter);
  let updated = 0;

  for (const p of products) {
    if (mode === "percent") {
      p.precio = Math.max(0, Math.round((p.precio ?? 0) * (1 + value / 100)));
    } else if (mode === "absolute") {
      p.precio = Math.max(0, Math.round(value));
    } else {
      throw new Error("mode inválido. Use 'percent' o 'absolute'.");
    }
    await p.save();
    updated++;
  }

  return { scope, mode, value, count: updated };
}

/**
 * payload:
 * { days: number, dryRun?: boolean }
 * Borra usuarios sin login por N días (y que no sean admins).
 */
export async function deleteInactiveUsers({ days = 90, dryRun = true } = {}) {
  const limit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const filter = {
    role: { $ne: "admin" },
    $or: [{ last_login_at: { $exists: false } }, { last_login_at: { $lte: limit } }],
  };

  const toDelete = await UserModel.find(filter, { email: 1, last_login_at: 1 }).lean();
  if (dryRun) {
    return { dryRun: true, candidates: toDelete.length, sample: toDelete.slice(0, 10) };
  }

  const result = await UserModel.deleteMany({ _id: { $in: toDelete.map((u) => u._id) } });
  return { dryRun: false, deleted: result.deletedCount || 0 };
}

/** ================== IMPORT PRODUCTS (CSV) ================== **/
/**
 * CSV esperado con headers (case-insensitive):
 * nombre, descripcion, precio, stock, categoria, imagen
 */
export async function importProductsFromCSV(filePath) {
  const raw = await fs.promises.readFile(filePath, "utf-8");
  // parseo simple (para CSV “normal” sin comas dentro de campos).
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { created: 0, skipped: 0, errors: ["CSV vacío"] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const required = ["nombre", "descripcion", "precio", "stock", "categoria", "imagen"];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Falta la columna requerida: ${r}`);
  }

  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  let created = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    try {
      const doc = {
        nombre: cols[idx.nombre]?.trim(),
        descripcion: cols[idx.descripcion]?.trim(),
        precio: Number(cols[idx.precio]),
        stock: Number(cols[idx.stock]),
        categoria: cols[idx.categoria]?.trim(),
        imagen: cols[idx.imagen]?.trim(),
      };

      if (!doc.nombre || Number.isNaN(doc.precio) || Number.isNaN(doc.stock)) {
        skipped++;
        continue;
      }
      await ProductModel.create(doc);
      created++;
    } catch (e) {
      errors.push(`Linea ${i + 1}: ${e.message}`);
    }
  }

  // limpieza
  try {
    await fs.promises.unlink(filePath);
  } catch (_) {}

  return { created, skipped, errors };
}
