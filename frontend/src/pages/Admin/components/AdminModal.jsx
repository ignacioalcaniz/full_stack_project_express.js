// src/pages/Admin/components/AdminModal.jsx
import "./AdminUI.css";

export function AdminModal({ open, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="admin-card"
        style={{ width: "min(880px, 100%)", padding: 14 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 950, fontSize: 16, color: "#0f172a" }}>{title}</div>
          <button className="admin-btn secondary" onClick={onClose}>Cerrar</button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>

        {footer && (
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
