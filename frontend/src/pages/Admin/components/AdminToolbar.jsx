// src/pages/Admin/components/AdminToolbar.jsx
import "./AdminUI.css";

export function AdminToolbar({ left, right }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{left}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{right}</div>
    </div>
  );
}
