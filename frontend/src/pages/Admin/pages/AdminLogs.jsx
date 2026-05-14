import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { AdminToolbar } from "../components/AdminToolbar";
import { AdminTable } from "../components/AdminTable";
import { downloadBlob } from "../components/downloadBlob";
import "../components/AdminUI.css";

export function AdminLogs() {
  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [q, setQ] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (adminId) params.set("adminId", adminId);
    if (action) params.set("action", action);
    if (q) params.set("q", q);
    if (statusCode) params.set("statusCode", statusCode);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params;
  }, [adminId, action, q, statusCode, from, to, page, limit]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const params = buildParams();
      const res = await axiosClient.get(`/admin/logs?${params.toString()}`);
      const payload = unwrap(res);

      const list = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];

      setItems(list);
      setMeta({
        total: Number(payload?.total ?? list.length ?? 0),
        pages: Number(payload?.pages ?? 1),
      });
    } catch (e) {
      setItems([]);
      setMeta({ total: 0, pages: 1 });
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    load();
  }, [load]);

  const exportFmt = useCallback(
    async (fmt) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("format", fmt);
        if (adminId) params.set("adminId", adminId);
        if (action) params.set("action", action);
        if (q) params.set("q", q);
        if (statusCode) params.set("statusCode", statusCode);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const res = await axiosClient.get(`/admin/logs/export?${params.toString()}`, {
          responseType: "blob",
        });

        downloadBlob(res, `admin_logs.${fmt}`);
        showToast("ok", `Export ${fmt.toUpperCase()} listo`);
      } catch (e) {
        showToast("danger", e?.response?.data?.error || e.message || "Error");
      } finally {
        setLoading(false);
      }
    },
    [adminId, action, q, statusCode, from, to, showToast]
  );

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        title: "Fecha",
        nowrap: true,
        render: (l) => (l.createdAt ? new Date(l.createdAt).toLocaleString("es-AR") : "—"),
      },
      {
        key: "admin",
        title: "Admin",
        render: (l) => l.adminId?.email || "—",
      },
      {
        key: "action",
        title: "Acción",
        render: (l) => (
          <span className="truncate" title={l.action}>
            {l.action}
          </span>
        ),
      },
      { key: "method", title: "Método", nowrap: true, render: (l) => l.method || "—" },
      { key: "route", title: "Ruta", render: (l) => l.route || "—" },
      {
        key: "statusCode",
        title: "Status",
        nowrap: true,
        render: (l) => {
          const sc = Number(l.statusCode || 0);
          const kind = sc >= 500 ? "danger" : sc >= 400 ? "warn" : "ok";
          return <span className={`pill ${kind}`}>{sc || "—"}</span>;
        },
      },
      { key: "ip", title: "IP", nowrap: true, render: (l) => l.ip || "—" },
      {
        key: "durationMs",
        title: "Duración",
        nowrap: true,
        render: (l) => (l.durationMs ? `${l.durationMs}ms` : "—"),
      },
    ],
    []
  );

  const canPrev = page > 1;
  const canNext = page < (meta.pages || 1);

  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setAdminId("");
    setAction("");
    setQ("");
    setStatusCode("");
    setFrom("");
    setTo("");
    setLimit(25);
    setPage(1);
    showToast("ok", "Filtros limpiados");
  }, [showToast]);

  useEffect(() => {
    load();
  }, [page, limit, load]);

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.text}</div>}

      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Logs Admin</h1>
          <p className="admin-sub">Auditoría de acciones del panel + exportación con filtros.</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-btn secondary" onClick={() => exportFmt("csv")} disabled={loading} type="button">
            Export CSV
          </button>
          <button className="admin-btn secondary" onClick={() => exportFmt("pdf")} disabled={loading} type="button">
            Export PDF
          </button>
          <button className="admin-btn primary" onClick={load} disabled={loading} type="button">
            {loading ? "Cargando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <div className="admin-card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Filtros</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="pill ghost">Total: {meta.total}</span>
            <span className="pill ghost">Página: {page}/{meta.pages || 1}</span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <AdminToolbar
            left={
              <>
                <input
                  className="admin-input"
                  placeholder="Buscar (acción/ruta/ip)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="adminId (opcional)..."
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="action (ej: products:delete)..."
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                />

                <select className="admin-select" value={statusCode} onChange={(e) => setStatusCode(e.target.value)}>
                  <option value="">status (todos)</option>
                  <option value="200">200 OK</option>
                  <option value="201">201 Created</option>
                  <option value="204">204 No Content</option>
                  <option value="400">400 Bad Request</option>
                  <option value="401">401 Unauthorized</option>
                  <option value="403">403 Forbidden</option>
                  <option value="404">404 Not Found</option>
                  <option value="409">409 Conflict</option>
                  <option value="429">429 Too Many Requests</option>
                  <option value="500">500 Server Error</option>
                </select>

                <input className="admin-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <input className="admin-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />

                <select
                  className="admin-select"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <button className="admin-btn secondary" onClick={applyFilters} disabled={loading} type="button">
                  Aplicar
                </button>
                <button className="admin-btn secondary" onClick={clearFilters} disabled={loading} type="button">
                  Limpiar
                </button>
              </>
            }
            right={
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className="admin-btn secondary"
                  disabled={!canPrev || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  ←
                </button>
                <span className="admin-muted">
                  Página <b>{page}</b> / {meta.pages || 1}
                </span>
                <button
                  className="admin-btn secondary"
                  disabled={!canNext || loading}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  →
                </button>
              </div>
            }
          />
        </div>
      </div>

      <AdminTable columns={columns} rows={Array.isArray(items) ? items : []} empty="No hay logs." />
    </div>
  );
}

