import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Package,
  CalendarDays,
  CreditCard,
  RefreshCcw,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import "./MisCompras.css";

function money(value) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

function statusLabel(status) {
  const s = String(status || "paid").toLowerCase();
  if (s === "completed") return "Completado";
  if (s === "processing") return "En preparación";
  if (s === "cancelled") return "Cancelado";
  return "Pagado";
}

function paymentMethodLabel(method) {
  const m = String(method || "card").toLowerCase();
  if (m === "transfer") return "Transferencia";
  if (m === "cash") return "Efectivo en local";
  return "Tarjeta";
}

function paymentStatusLabel(status) {
  const s = String(status || "paid").toLowerCase();
  if (s === "pending") return "Pago pendiente";
  return "Pago confirmado";
}

export const MisCompras = () => {
  const fetchMyOrders = useAuthStore((s) => s.fetchMyOrders);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetchMyOrders();

      if (!res?.success) {
        setErr(res?.error || "No pudimos cargar tus compras.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(res.orders) ? res.orders : []);
    } catch (e) {
      setErr(e?.message || "No pudimos cargar tus compras.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders]);

  useEffect(() => {
    document.title = "Mis compras - THE LIBRARY";
    loadOrders();
  }, [loadOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const amount = orders.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const products = orders.reduce(
      (acc, item) =>
        acc +
        (Array.isArray(item.products)
          ? item.products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
          : 0),
      0
    );

    return {
      total,
      amount,
      products,
    };
  }, [orders]);

  return (
    <main className="compras-page">
      <div className="compras-shell">
        <section className="compras-card">
          <div className="compras-head">
            <div>
              <span className="compras-badge">Historial de compras</span>
              <h1 className="compras-title">Mis compras</h1>
              <p className="compras-subtitle">
                Revisá tus pedidos, estados, productos comprados, fechas y montos totales.
              </p>
            </div>

            <button className="compras-btn" onClick={loadOrders} disabled={loading} type="button">
              <RefreshCcw size={16} />
              <span>{loading ? "Actualizando..." : "Refrescar"}</span>
            </button>
          </div>

          <div className="compras-stats">
            <div className="compras-stat">
              <ShoppingBag size={18} />
              <div>
                <span>Total pedidos</span>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="compras-stat">
              <CreditCard size={18} />
              <div>
                <span>Total gastado</span>
                <strong>{money(stats.amount)}</strong>
              </div>
            </div>

            <div className="compras-stat">
              <Package size={18} />
              <div>
                <span>Unidades compradas</span>
                <strong>{stats.products}</strong>
              </div>
            </div>
          </div>

          {err && <div className="compras-alert">❌ {err}</div>}

          {loading ? (
            <div className="compras-empty">Cargando compras...</div>
          ) : orders.length === 0 ? (
            <div className="compras-empty">
              <Package size={22} />
              <span>Todavía no tenés compras registradas.</span>
            </div>
          ) : (
            <div className="compras-list">
              {orders.map((order, index) => {
                const products = Array.isArray(order.products) ? order.products : [];

                return (
                  <article key={order._id || order.code || index} className="compra-item">
                    <div className="compra-top">
                      <div className="compra-left">
                        <div className="compra-icon">
                          <Receipt size={18} />
                        </div>

                        <div>
                          <h3>Pedido #{order.code || "—"}</h3>
                          <p>
                            <CalendarDays size={14} />
                            <span>
                              {order.purchase_datetime
                                ? new Date(order.purchase_datetime).toLocaleDateString("es-AR")
                                : "Fecha no disponible"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="compra-right">
                        <span className="compra-label">Total</span>
                        <strong>{money(order.amount)}</strong>
                      </div>
                    </div>

                    <div className="compra-meta-row">
                      <span className="compra-chip">Items: {products.length}</span>

                      <span className={`compra-chip status ${String(order.status || "paid").toLowerCase()}`}>
                        <CheckCircle2 size={14} />
                        {statusLabel(order.status)}
                      </span>

                      <span className="compra-chip ghost">
                        {paymentMethodLabel(order.paymentMethod)}
                      </span>

                      <span className={`compra-chip payment ${String(order.paymentStatus || "paid").toLowerCase()}`}>
                        {paymentStatusLabel(order.paymentStatus)}
                      </span>

                      {order.purchaser && (
                        <span className="compra-chip ghost">{order.purchaser}</span>
                      )}
                    </div>

                    {products.length > 0 && (
                      <div className="compra-products">
                        {products.map((product, idx) => (
                          <div
                            key={`${product.productId || product._id || idx}`}
                            className="compra-product-row"
                          >
                            <div className="compra-product-left">
                              <div className="compra-product-thumb">
                                {product.imagen || product.image ? (
                                  <img
                                    src={product.imagen || product.image}
                                    alt={product.title || "Producto"}
                                  />
                                ) : (
                                  <span>📘</span>
                                )}
                              </div>

                              <div className="compra-product-info">
                                <strong>{product.title || "Producto"}</strong>
                                <p>
                                  Cantidad: {product.quantity ?? 1}
                                  {typeof product.price !== "undefined"
                                    ? ` · Unitario: ${money(product.price)}`
                                    : ""}
                                  {typeof product.subtotal !== "undefined"
                                    ? ` · Subtotal: ${money(product.subtotal)}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};