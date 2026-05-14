import fs from "node:fs";
import { PassThrough } from "node:stream";
import mongoose from "mongoose";
import { ProductModel } from "../model/product.model.js";
import { UserModel } from "../model/user.model.js";
import { TicketModel } from "../model/ticket.model.js";
import { buildPdfStream } from "../utils/pdf.util.js";

function toCsvRow(values) {
  return values
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(",");
}

function arrayToCsvStream(headers, rows) {
  const pass = new PassThrough();

  queueMicrotask(() => {
    pass.write(toCsvRow(headers) + "\n");
    for (const row of rows) {
      pass.write(toCsvRow(row) + "\n");
    }
    pass.end();
  });

  return pass;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function makePdfStream(title, columns, rows) {
  return await buildPdfStream({ title, columns, rows });
}

function pickFormats(format, baseName) {
  if (format === "pdf") {
    return {
      filename: `${baseName}_${nowStamp()}.pdf`,
      contentType: "application/pdf",
    };
  }

  return {
    filename: `${baseName}_${nowStamp()}.csv`,
    contentType: "text/csv; charset=utf-8",
  };
}

function normalizeString(value = "") {
  return String(value || "").trim();
}

function normalizeObjectIds(ids = []) {
  return ids
    .map((id) => normalizeString(id))
    .filter(Boolean)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function normalizeBulkPayload({
  scope = "all",
  mode = "percent",
  value,
  category,
  ids,
} = {}) {
  const cleanScope = normalizeString(scope).toLowerCase();
  const cleanMode = normalizeString(mode).toLowerCase();
  const numericValue = Number(value);

  if (!["all", "category", "ids"].includes(cleanScope)) {
    throw new Error("scope inválido. Use 'all', 'category' o 'ids'.");
  }

  if (!["percent", "absolute"].includes(cleanMode)) {
    throw new Error("mode inválido. Use 'percent' o 'absolute'.");
  }

  if (!Number.isFinite(numericValue)) {
    throw new Error("value debe ser un número válido.");
  }

  if (cleanMode === "absolute" && numericValue < 0) {
    throw new Error("El precio absoluto no puede ser negativo.");
  }

  if (cleanMode === "percent" && numericValue <= -100) {
    throw new Error("El porcentaje no puede ser menor o igual a -100%.");
  }

  return {
    scope: cleanScope,
    mode: cleanMode,
    value: numericValue,
    category: normalizeString(category),
    ids: Array.isArray(ids) ? ids : [],
  };
}

/* ================== EXPORTS ================== */

export async function exportProducts(format = "csv") {
  const products = await ProductModel.find({}, "-__v").lean();

  const columns = [
    "_id",
    "nombre",
    "descripcion",
    "precio",
    "stock",
    "categoria",
    "imagen",
    "createdAt",
    "updatedAt",
  ];

  const rows = products.map((p) => columns.map((c) => p[c] ?? ""));

  const meta = pickFormats(format, "products");

  const stream =
    format === "pdf"
      ? await makePdfStream("Productos", columns, rows)
      : arrayToCsvStream(columns, rows);

  return { ...meta, stream };
}

export async function exportUsers(format = "csv") {
  const users = await UserModel.find({}, "-password -refreshTokens -__v").lean();

  const columns = [
    "_id",
    "email",
    "role",
    "first_name",
    "last_name",
    "age",
    "lastLoginAt",
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

  const columns = [
    "_id",
    "code",
    "purchase_datetime",
    "amount",
    "purchaser",
    "productsCount",
  ];

  const rows = tickets.map((t) => [
    t._id,
    t.code,
    t.purchase_datetime?.toISOString?.() ?? t.purchase_datetime,
    t.amount,
    t.purchaser,
    t.products?.length ?? 0,
  ]);

  const meta = pickFormats(format, "sales");

  const stream =
    format === "pdf"
      ? await makePdfStream("Ventas", columns, rows)
      : arrayToCsvStream(columns, rows);

  return { ...meta, stream };
}

/* ================== BULK ACTIONS ================== */

export async function bulkUpdatePrices(payload = {}) {
  const { scope, mode, value, category, ids } = normalizeBulkPayload(payload);

  const filter = {};

  if (scope === "category") {
    if (!category) {
      throw new Error("Debe indicar 'category' cuando scope='category'.");
    }

    filter.categoria = category;
  }

  if (scope === "ids") {
    const validIds = normalizeObjectIds(ids);

    if (!validIds.length) {
      throw new Error("Debe indicar IDs válidos cuando scope='ids'.");
    }

    filter._id = { $in: validIds };
  }

  const matched = await ProductModel.countDocuments(filter);

  if (matched === 0) {
    return {
      scope,
      mode,
      value,
      category: category || null,
      matched: 0,
      modified: 0,
      message: "No se encontraron productos para actualizar.",
    };
  }

  let updatePipeline;

  if (mode === "percent") {
    const multiplier = 1 + value / 100;

    updatePipeline = [
      {
        $set: {
          precio: {
            $max: [
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $ifNull: ["$precio", 0],
                      },
                      multiplier,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
          updatedAt: new Date(),
        },
      },
    ];
  }

  if (mode === "absolute") {
    updatePipeline = [
      {
        $set: {
          precio: Math.max(0, Math.round(value)),
          updatedAt: new Date(),
        },
      },
    ];
  }

  const result = await ProductModel.updateMany(filter, updatePipeline);

  return {
    scope,
    mode,
    value,
    category: category || null,
    matched,
    modified: result.modifiedCount || 0,
    message: `Actualización aplicada sobre ${
      result.modifiedCount || 0
    } producto(s).`,
  };
}

export async function deleteInactiveUsers({ days = 90, dryRun = true } = {}) {
  const safeDays = Math.max(1, Number(days) || 90);
  const limit = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  const filter = {
    role: { $ne: "admin" },
    $or: [
      { lastLoginAt: { $exists: false } },
      { lastLoginAt: null },
      { lastLoginAt: { $lte: limit } },
    ],
  };

  const toDelete = await UserModel.find(filter, {
    email: 1,
    lastLoginAt: 1,
  }).lean();

  if (dryRun) {
    return {
      dryRun: true,
      candidates: toDelete.length,
      sample: toDelete.slice(0, 10),
    };
  }

  const result = await UserModel.deleteMany({
    _id: { $in: toDelete.map((u) => u._id) },
  });

  return {
    dryRun: false,
    deleted: result.deletedCount || 0,
  };
}

/* ================== IMPORT PRODUCTS CSV ================== */

function parseCsvLine(line = "") {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

export async function importProductsFromCSV(filePath) {
  const raw = await fs.promises.readFile(filePath, "utf-8");

  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      created: 0,
      skipped: 0,
      errors: ["CSV vacío"],
    };
  }

  const headers = parseCsvLine(lines[0]).map((h) =>
    normalizeString(h).toLowerCase()
  );

  const required = [
    "nombre",
    "descripcion",
    "precio",
    "stock",
    "categoria",
    "imagen",
  ];

  for (const col of required) {
    if (!headers.includes(col)) {
      throw new Error(`Falta la columna requerida: ${col}`);
    }
  }

  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    try {
      const doc = {
        nombre: normalizeString(cols[idx.nombre]),
        descripcion: normalizeString(cols[idx.descripcion]),
        precio: Number(cols[idx.precio]),
        stock: Number(cols[idx.stock]),
        categoria: normalizeString(cols[idx.categoria]) || "general",
        imagen: normalizeString(cols[idx.imagen]),
      };

      if (!doc.nombre || Number.isNaN(doc.precio) || Number.isNaN(doc.stock)) {
        skipped++;
        continue;
      }

      await ProductModel.create(doc);
      created++;
    } catch (e) {
      errors.push(`Línea ${i + 1}: ${e.message}`);
    }
  }

  try {
    await fs.promises.unlink(filePath);
  } catch {}

  return {
    created,
    skipped,
    errors,
  };
}
