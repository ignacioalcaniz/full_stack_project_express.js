import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useDashboardLive } from "../../../hooks/useDashboardLive";
import "../components/AdminUI.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

function trendText(current, previous) {
  if (!previous && current) return "Sin base previa";
  if (!previous && !current) return "Sin cambios";
  const diff = current - previous;
  const pct = previous === 0 ? 100 : (diff / previous) * 100;
  if (diff > 0) return `▲ ${pct.toFixed(1)}% vs período previo`;
  if (diff < 0) return `▼ ${Math.abs(pct).toFixed(1)}% vs período previo`;
  return "— Sin variación";
}

function ChartBlock({ height = 340, children, emptyText = "No hay datos todavía." }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateReady = () => {
      const rect = el.getBoundingClientRect();
      setReady(rect.width > 0 && rect.height > 0);
    };

    updateReady();

    const ro = new ResizeObserver(() => {
      updateReady();
    });

    ro.observe(el);

    const raf = requestAnimationFrame(updateReady);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height,
        minWidth: 0,
        minHeight: height,
        marginTop: 16,
      }}
    >
      {ready ? children : <div style={{ color: "#64748b", fontWeight: 800 }}>{emptyText}</div>}
    </div>
  );
}

export function AdminDashboard() {
  const [months, setMonths] = useState(6);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const refreshKey = useDashboardLive();

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await axiosClient.get(`/admin/dashboard/stats?months=${months}`);
      setStats(unwrap(res));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const salesChart = useMemo(() => {
    const list = stats?.salesByMonth || [];
    return list.map((x) => ({
      label: `${String(x.month).padStart(2, "0")}/${x.year}`,
      amount: Number(x.totalAmount || 0),
      count: Number(x.count || 0),
    }));
  }, [stats]);

  const analytics = useMemo(() => {
    const byMonth = stats?.salesByMonth || [];
    const totalRevenue = byMonth.reduce((a, x) => a + Number(x.totalAmount || 0), 0);
    const totalOrders = byMonth.reduce((a, x) => a + Number(x.count || 0), 0);
    const lowStockCount = stats?.lowStock?.length || 0;
    const activeUsers = Number(stats?.activeUsers || 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const currentWindow = byMonth.slice(Math.max(0, byMonth.length - Math.ceil(months / 2)));
    const previousWindow = byMonth.slice(
      Math.max(0, byMonth.length - months),
      Math.max(0, byMonth.length - Math.ceil(months / 2))
    );

    const currentRevenue = currentWindow.reduce((a, x) => a + Number(x.totalAmount || 0), 0);
    const previousRevenue = previousWindow.reduce((a, x) => a + Number(x.totalAmount || 0), 0);

    const currentOrders = currentWindow.reduce((a, x) => a + Number(x.count || 0), 0);
    const previousOrders = previousWindow.reduce((a, x) => a + Number(x.count || 0), 0);

    return {
      totalRevenue,
      totalOrders,
      lowStockCount,
      activeUsers,
      avgTicket,
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
    };
  }, [stats, months]);

  const kpis = useMemo(() => {
    return [
      {
        label: "Ingresos",
        value: formatMoney(analytics.totalRevenue),
        hint: `últimos ${months} meses`,
        trend: trendText(analytics.currentRevenue, analytics.previousRevenue),
      },
      {
        label: "Órdenes",
        value: Number(analytics.totalOrders || 0).toLocaleString("es-AR"),
        hint: "tickets emitidos",
        trend: trendText(analytics.currentOrders, analytics.previousOrders),
      },
      {
        label: "Ticket promedio",
        value: formatMoney(analytics.avgTicket),
        hint: "revenue / órdenes",
        trend: analytics.totalOrders > 0 ? "Salud comercial" : "Sin ventas todavía",
      },
      {
        label: "Usuarios activos",
        value: Number(analytics.activeUsers || 0).toLocaleString("es-AR"),
        hint: "últimos 30 días",
        trend: analytics.activeUsers > 0 ? "Actividad registrada" : "Sin actividad reciente",
      },
    ];
  }, [analytics, months]);

  const insight = useMemo(() => {
    if (!salesChart.length) {
      return "Todavía no hay suficientes datos para generar insights automáticos.";
    }

    const bestMonth = [...salesChart].sort((a, b) => b.amount - a.amount)[0];
    const worstMonth = [...salesChart].sort((a, b) => a.amount - b.amount)[0];

    if (!bestMonth || !worstMonth) {
      return "Todavía no hay suficientes datos para generar insights automáticos.";
    }

    return `Mejor mes: ${bestMonth.label} con ${formatMoney(bestMonth.amount)}. Mes más flojo: ${worstMonth.label} con ${formatMoney(worstMonth.amount)}.`;
  }, [salesChart]);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Dashboard</h1>
          <p className="admin-sub">KPIs, ventas, actividad y alertas operativas del sistema.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="admin-select"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
          </select>

          <button className="admin-btn primary" onClick={load} disabled={loading} type="button">
            {loading ? "Cargando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <div className="admin-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="admin-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-hint">{k.hint}</div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 900, color: "#475569" }}>
              {k.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Revenue overview</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Evolución mensual de ingresos para el período seleccionado.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="pill ok">Ingresos: {formatMoney(analytics.totalRevenue)}</span>
            <span className="pill">Órdenes: {analytics.totalOrders}</span>
            <span className={`pill ${analytics.lowStockCount > 0 ? "warn" : "ok"}`}>
              Stock bajo: {analytics.lowStockCount}
            </span>
          </div>
        </div>

        <ChartBlock height={340}>
          {salesChart.length === 0 ? (
            <div style={{ color: "#64748b", fontWeight: 800 }}>No hay datos todavía.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={salesChart} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="amountFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3483fa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3483fa" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "amount" ? formatMoney(value) : value,
                    name === "amount" ? "Ingresos" : "Órdenes",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Ingresos"
                  stroke="#3483fa"
                  fill="url(#amountFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartBlock>
      </div>

      <div className="admin-grid2">
        <div className="admin-card">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Órdenes por mes</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Volumen mensual de tickets emitidos.
          </div>

          <ChartBlock height={280}>
            {salesChart.length === 0 ? (
              <div style={{ color: "#64748b", fontWeight: 800 }}>No hay datos todavía.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={salesChart} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, "Órdenes"]} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Órdenes"
                    stroke="#111827"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartBlock>
        </div>

        <div className="admin-card">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Insight rápido</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Resumen ejecutivo del comportamiento reciente.
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              background: "linear-gradient(180deg, rgba(52,131,250,.08), rgba(52,131,250,.03))",
              border: "1px solid rgba(52,131,250,.16)",
            }}
          >
            <div style={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.6 }}>{insight}</div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div className="admin-tagrow">
                <span className="admin-tag ghost">Ticket promedio</span>
                <span className="admin-tag">{formatMoney(analytics.avgTicket)}</span>
              </div>
              <div className="admin-tagrow">
                <span className="admin-tag ghost">Usuarios activos</span>
                <span className="admin-tag">{analytics.activeUsers}</span>
              </div>
              <div className="admin-tagrow">
                <span className="admin-tag ghost">Alertas stock</span>
                <span className={`admin-tag ${analytics.lowStockCount > 0 ? "" : "ghost"}`}>
                  {analytics.lowStockCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid2">
        <div className="admin-card">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Top productos</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Más vendidos por cantidad y revenue generado.
          </div>

          <div style={{ marginTop: 14, borderTop: "1px solid #eef2f7" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 130px",
                gap: 10,
                padding: "10px 6px",
                fontSize: 12,
                fontWeight: 950,
                color: "#475569",
              }}
            >
              <span>Producto</span>
              <span>Cant.</span>
              <span>Revenue</span>
            </div>

            {(stats?.topProducts || []).slice(0, 10).map((p, idx) => (
              <div
                key={p._id || idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 90px 130px",
                  gap: 10,
                  padding: "12px 6px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 13,
                  fontWeight: 800,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 950 }}>
                    {p.title || p.nombre || p._id}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Ranking #{idx + 1}
                  </div>
                </div>
                <span>{Number(p.totalQty || 0).toLocaleString("es-AR")}</span>
                <span>{formatMoney(p.totalRevenue || 0)}</span>
              </div>
            ))}

            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <div style={{ padding: "12px 6px", color: "#64748b", fontWeight: 800 }}>
                No hay datos todavía.
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Alertas de stock</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Productos con stock crítico o bajo.
          </div>

          <div style={{ marginTop: 14, borderTop: "1px solid #eef2f7" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px",
                gap: 10,
                padding: "10px 6px",
                fontSize: 12,
                fontWeight: 950,
                color: "#475569",
              }}
            >
              <span>Producto</span>
              <span>Stock</span>
            </div>

            {(stats?.lowStock || []).slice(0, 12).map((p) => (
              <div
                key={p._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px",
                  gap: 10,
                  padding: "12px 6px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 13,
                  fontWeight: 800,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 950 }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    {p.stock <= 0 ? "Sin stock" : "Reposición recomendada"}
                  </div>
                </div>

                <span className={`pill ${p.stock <= 0 ? "danger" : "warn"}`}>
                  {p.stock}
                </span>
              </div>
            ))}

            {(!stats?.lowStock || stats.lowStock.length === 0) && (
              <div style={{ padding: "12px 6px", color: "#64748b", fontWeight: 800 }}>
                Sin alertas 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


