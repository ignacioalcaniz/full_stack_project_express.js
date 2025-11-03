// src/utils/csv.util.js
export function toCSV(rows = []) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    // Escapa comillas y separadores
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => escape(r[h])).join(",")).join("\n");
  return head + "\n" + body;
}
