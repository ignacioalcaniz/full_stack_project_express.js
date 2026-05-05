// src/pages/Admin/components/AdminPagination.jsx
import "./AdminUI.css";

export function AdminPagination({ page = 1, limit = 20, total = 0, onPage }) {
  const pages = Math.max(1, Math.ceil(Number(total) / Number(limit)));
  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
      <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>
        Página {page} / {pages} · Total {total}
      </span>
      <button className="admin-btn secondary" disabled={!canPrev} onClick={() => onPage(page - 1)}>Anterior</button>
      <button className="admin-btn secondary" disabled={!canNext} onClick={() => onPage(page + 1)}>Siguiente</button>
    </div>
  );
}
