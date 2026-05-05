// src/pages/Admin/components/AdminTable.jsx
import "./AdminUI.css";

export function AdminTable({ columns = [], rows, empty = "Sin datos" }) {
  // ✅ blindaje: si rows no es array, aceptamos {items: []} o fallback []
  const safeRows = Array.isArray(rows) ? rows : Array.isArray(rows?.items) ? rows.items : [];

  return (
    <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: c.align || "left",
                    padding: "12px 12px",
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 950,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {safeRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 16, color: "#64748b", fontWeight: 800 }}>
                  {empty}
                </td>
              </tr>
            ) : (
              safeRows.map((r, idx) => (
                <tr key={r._key || r._id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "12px 12px",
                        fontSize: 13,
                        color: "#0f172a",
                        fontWeight: 750,
                        textAlign: c.align || "left",
                        verticalAlign: "middle",
                        whiteSpace: c.nowrap ? "nowrap" : "normal",
                      }}
                    >
                      {c.render ? c.render(r) : r?.[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

