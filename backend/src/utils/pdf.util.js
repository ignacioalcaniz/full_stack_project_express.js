// src/utils/pdf.util.js
import { PassThrough } from "node:stream";

/**
 * Construye un PDF como stream usando pdfkit si está instalado.
 * Si no está, lanza un error claro para que el caller decida.
 */
export async function buildPdfStream({ title = "Reporte", columns = [], rows = [] }) {
  let PDFDocument;
  try {
    // import dinámico para no romper si no está instalado
    ({ default: PDFDocument } = await import("pdfkit"));
  } catch (e) {
    throw new Error("pdfkit no está instalado. Ejecutá: npm i pdfkit (o usá formato CSV).");
  }

  const pass = new PassThrough();
  const doc = new PDFDocument({ margin: 36, size: "A4" });

  doc.pipe(pass);

  doc.fontSize(18).text(title, { underline: false, align: "left" });
  doc.moveDown(1);

  // Encabezado
  doc.fontSize(10).fillColor("#000").text(columns.join(" | "));
  doc.moveDown(0.5);
  doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  for (const r of rows) {
    doc.fontSize(9).fillColor("#111").text(r.map((v) => (v ?? "")).join(" | "));
  }

  doc.end();
  return pass;
}
