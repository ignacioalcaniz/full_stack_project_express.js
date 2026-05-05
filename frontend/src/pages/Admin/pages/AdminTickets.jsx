// src/pages/Admin/pages/AdminTickets.jsx
import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { AdminToolbar } from "../components/AdminToolbar";
import { AdminTable } from "../components/AdminTable";
import { AdminPagination } from "../components/AdminPagination";
import { AdminModal } from "../components/AdminModal";
import { downloadBlob } from "../components/downloadBlob";
import "../components/AdminUI.css";

const paymentMethodLabel = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Efectivo",
};

const paymentStatusLabel = {
  paid: "Pagado",
  pending: "Pendiente",
};

const orderStatusLabel = {
  paid: "Pagado",
  processing: "En preparación",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function AdminTickets() {
  const [purchaser, setPurchaser] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        purchaser,
        dateFrom,
        dateTo,
      }).toString();

      const res = await axiosClient.get(`/admin/tickets?${qs}`);
      setData(res.data?.data || res.data || { items: [], total: 0, page, limit });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  async function confirmPayment(ticketId) {
    try {
      setLoading(true);
      setErr(null);

      const res = await axiosClient.patch(`/admin/tickets/${ticketId}/confirm-payment`);
      const updated = res.data?.data || res.data;

      setSelected(updated);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "No se pudo confirmar el pago");
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "code", title: "Ticket", nowrap: true, render: (t) => t.code || t._id },
      {
        key: "purchaser",
        title: "Comprador",
        render: (t) => <span className="truncate" title={t.purchaser}>{t.purchaser}</span>,
      },
      {
        key: "purchase_datetime",
        title: "Fecha",
        nowrap: true,
        render: (t) =>
          t.purchase_datetime ? new Date(t.purchase_datetime).toLocaleString("es-AR") : "—",
      },
      {
        key: "paymentMethod",
        title: "Método",
        nowrap: true,
        render: (t) => paymentMethodLabel[t.paymentMethod] || "Tarjeta",
      },
      {
        key: "paymentStatus",
        title: "Pago",
        nowrap: true,
        render: (t) => paymentStatusLabel[t.paymentStatus] || "Pagado",
      },
      {
        key: "amount",
        title: "Total",
        nowrap: true,
        align: "right",
        render: (t) => `$${Number(t.amount || 0).toLocaleString("es-AR")}`,
      },
      {
        key: "actions",
        title: "Detalle",
        align: "right",
        nowrap: true,
        render: (t) => (
          <button
            className="admin-btn secondary"
            disabled={loading}
            onClick={() => {
              setSelected(t);
              setOpen(true);
            }}
          >
            Ver
          </button>
        ),
      },
    ],
    [loading]
  );

  async function downloadReport() {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ dateFrom, dateTo }).toString();
      const res = await axiosClient.get(`/admin/tickets/report?${qs}`, {
        responseType: "blob",
      });
      downloadBlob(res, "sales_report.csv");
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const productsRows = selected?.products || [];
  const canConfirmManually =
    selected &&
    selected.paymentStatus === "pending" &&
    ["transfer", "cash"].includes(selected.paymentMethod);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Ventas</h1>
          <p className="admin-sub">Tickets, filtros y detalle de compra.</p>
        </div>
        <button className="admin-btn secondary" onClick={downloadReport} disabled={loading}>
          Descargar reporte CSV
        </button>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <AdminToolbar
        left={
          <>
            <input
              className="admin-input"
              placeholder="purchaser (email)..."
              value={purchaser}
              onChange={(e) => setPurchaser(e.target.value)}
            />
            <input className="admin-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input className="admin-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <button
              className="admin-btn secondary"
              onClick={() => {
                setPage(1);
                load();
              }}
              disabled={loading}
            >
              Filtrar
            </button>
          </>
        }
        right={<AdminPagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />}
      />

      <AdminTable columns={columns} rows={data.items} empty="No hay tickets." />

      <AdminModal
        open={open}
        title={`Detalle ticket ${selected?.code || selected?._id || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {canConfirmManually && (
              <button
                className="admin-btn primary"
                onClick={() => confirmPayment(selected._id)}
                disabled={loading}
              >
                Confirmar pago
              </button>
            )}
            <button className="admin-btn secondary" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
        }
      >
        {!selected ? (
          <div style={{ color: "#64748b", fontWeight: 800 }}>Sin selección</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div className="admin-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Comprador</div>
                  <div style={{ fontWeight: 950 }}>{selected.purchaser}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Fecha</div>
                  <div style={{ fontWeight: 950 }}>
                    {selected.purchase_datetime
                      ? new Date(selected.purchase_datetime).toLocaleString("es-AR")
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Método de pago</div>
                  <div style={{ fontWeight: 950 }}>
                    {paymentMethodLabel[selected.paymentMethod] || "Tarjeta"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Estado del pago</div>
                  <div style={{ fontWeight: 950 }}>
                    {paymentStatusLabel[selected.paymentStatus] || "Pagado"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Estado pedido</div>
                  <div style={{ fontWeight: 950 }}>
                    {orderStatusLabel[selected.status] || selected.status || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Total</div>
                  <div style={{ fontWeight: 950 }}>
                    ${Number(selected.amount || 0).toLocaleString("es-AR")}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 12, fontWeight: 950, color: "#0f172a" }}>Productos</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "#475569", fontWeight: 950 }}>Título</th>
                      <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "#475569", fontWeight: 950 }}>Cantidad</th>
                      <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "#475569", fontWeight: 950 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: 14, color: "#64748b", fontWeight: 800 }}>
                          No hay productos en este ticket.
                        </td>
                      </tr>
                    ) : (
                      productsRows.map((p, idx) => (
                        <tr key={p.productId || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: 12, fontWeight: 900 }}>{p.title || p.nombre || "—"}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 900 }}>{p.quantity ?? "—"}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 900 }}>
                            ${Number(p.subtotal || 0).toLocaleString("es-AR")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
