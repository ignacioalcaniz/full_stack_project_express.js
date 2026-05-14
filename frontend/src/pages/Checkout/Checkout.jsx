import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import axiosClient from "../../api/axiosClient";
import "./Checkout.css";

const initialCreditForm = {
  name: "",
  lastName: "",
  installments: "1",
};

const initialDebitForm = {
  name: "",
  lastName: "",
};

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, loading, fetchCart, resetCart } = useCartStore();

  const [metodo, setMetodo] = useState("mercadopago");
  const [redirectingMP, setRedirectingMP] = useState(false);
  const [creditForm, setCreditForm] = useState(initialCreditForm);
  const [debitForm, setDebitForm] = useState(initialDebitForm);

  useEffect(() => {
    document.title = "Checkout - THE LIBRARY";
  }, []);

  useEffect(() => {
    if (user?.cart) fetchCart();
  }, [user, fetchCart]);

  const items = useMemo(() => {
    const list = cart?.products || [];
    return list
      .map((it) => {
        const p = it.product;
        if (!p) return null;

        return {
          prodId: p._id,
          nombre: p.nombre,
          imagen: p.imagen,
          precio: Number(p.precio || 0),
          quantity: Number(it.quantity || 1),
        };
      })
      .filter(Boolean);
  }, [cart]);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.quantity, 0),
    [items]
  );

  const envio = 0;
  const total = subtotal + envio;

  const paymentLabels = {
    card_credit: "Tarjeta de crédito",
    card_debit: "Tarjeta de débito",
    mercadopago: "Mercado Pago",
    transfer: "Transferencia",
    cash: "Efectivo en local",
  };

  const paymentStatusLabels = {
    card_credit: "pending",
    card_debit: "pending",
    mercadopago: "pending",
    transfer: "pending",
    cash: "pending",
  };

  const isMercadoPagoMode = ["card_credit", "card_debit", "mercadopago"].includes(
    metodo
  );

  const handleCreditChange = (field, value) => {
    setCreditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDebitChange = (field, value) => {
    setDebitForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateMercadoPagoSection = () => {
    if (metodo === "mercadopago") return { ok: true };

    if (metodo === "card_credit") {
      const required = [creditForm.name, creditForm.lastName, creditForm.installments];

      if (required.some((v) => !String(v || "").trim())) {
        return {
          ok: false,
          message: "Completá el nombre, apellido y cuotas para continuar.",
        };
      }
    }

    if (metodo === "card_debit") {
      const required = [debitForm.name, debitForm.lastName];

      if (required.some((v) => !String(v || "").trim())) {
        return {
          ok: false,
          message: "Completá el nombre y apellido para continuar.",
        };
      }
    }

    return { ok: true };
  };

  const buildCustomerDraft = () => {
    if (metodo === "card_credit") {
      return {
        name: creditForm.name,
        lastName: creditForm.lastName,
      };
    }

    if (metodo === "card_debit") {
      return {
        name: debitForm.name,
        lastName: debitForm.lastName,
      };
    }

    return {};
  };

  const getInstallmentsForMode = () => {
    if (metodo === "card_credit") {
      return Number(creditForm.installments || 1);
    }
    return 1;
  };

  const showPrettyError = async (title, text) => {
    await Swal.fire({
      icon: "error",
      title,
      html: `
        <div style="text-align:left; line-height:1.7;">
          <p style="margin:0; color:#475569;">${text}</p>
        </div>
      `,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#2563eb",
      customClass: {
        popup: "checkout-swal-popup",
        title: "checkout-swal-title",
        confirmButton: "checkout-swal-confirm",
      },
    });
  };

  const payWithMercadoPago = async () => {
    try {
      const validation = validateMercadoPagoSection();

      if (!validation.ok) {
        await Swal.fire({
          icon: "warning",
          title: "Revisá los datos",
          html: `
            <div style="text-align:left; line-height:1.7;">
              <p style="margin:0; color:#475569;">${validation.message}</p>
            </div>
          `,
          confirmButtonText: "Corregir",
          confirmButtonColor: "#2563eb",
          customClass: {
            popup: "checkout-swal-popup",
            title: "checkout-swal-title",
            confirmButton: "checkout-swal-confirm",
          },
        });
        return;
      }

      setRedirectingMP(true);

      const { isConfirmed } = await Swal.fire({
        icon: "question",
        title: "Confirmar continuación",
        html: `
          <div style="text-align:left; line-height:1.8;">
            <p style="margin:0 0 10px;">
              <strong>Método:</strong> ${paymentLabels[metodo]}
            </p>
            <p style="margin:0 0 10px;">
              <strong>Total:</strong> ${total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
            <p style="margin:0; color:#475569;">
              Vas a continuar en el entorno seguro de Mercado Pago para completar el pago.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Volver",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
        customClass: {
          popup: "checkout-swal-popup",
          title: "checkout-swal-title",
          confirmButton: "checkout-swal-confirm",
          cancelButton: "checkout-swal-cancel",
        },
      });

      if (!isConfirmed) {
        setRedirectingMP(false);
        return;
      }

      const res = await axiosClient.post("/payments/create-preference", {
        mode: metodo,
        installments: getInstallmentsForMode(),
        customerDraft: buildCustomerDraft(),
      });

      const data = res.data?.data || {};
      const initPoint = data.initPoint;

if (!initPoint) {
  throw new Error("No se pudo generar el link de pago productivo.");
}

      window.location.href = initPoint;
    } catch (e) {
      setRedirectingMP(false);
      await showPrettyError(
        "No pudimos iniciar Mercado Pago",
        e?.response?.data?.error || e.message || "Ocurrió un error inesperado."
      );
    }
  };

  const payOffline = async () => {
    try {
      const confirmText =
        metodo === "transfer"
          ? "Se generará tu ticket y el pago quedará pendiente. Luego de realizar la transferencia, podrás coordinar el retiro en el local."
          : "Se generará tu ticket y el pedido quedará pendiente para que pagues en efectivo al momento de retirar en el local.";

      const { isConfirmed } = await Swal.fire({
        icon: "question",
        title: "Confirmar compra",
        html: `
          <div style="text-align:left; line-height:1.8;">
            <p style="margin:0 0 10px;">
              <strong>Método:</strong> ${paymentLabels[metodo]}
            </p>
            <p style="margin:0; color:#475569;">
              ${confirmText}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Volver",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
        customClass: {
          popup: "checkout-swal-popup",
          title: "checkout-swal-title",
          confirmButton: "checkout-swal-confirm",
          cancelButton: "checkout-swal-cancel",
        },
      });

      if (!isConfirmed) return;

      const res = await axiosClient.post("/carts/checkout", {
        paymentMethod: metodo,
      });

      const ticket = res.data?.data?.ticket ?? res.data?.data;
      const rejected = res.data?.data?.rejectedProducts ?? [];

      resetCart();

      if (rejected.length) {
        await Swal.fire({
          icon: "warning",
          title: "Compra parcial",
          html: `
            <div style="text-align:left; line-height:1.8;">
              <p style="margin:0 0 10px;">
                Algunos productos no pudieron procesarse por stock.
              </p>
              <p style="margin:0;">
                Igual generamos tu ticket correctamente.
              </p>
            </div>
          `,
          confirmButtonText: "Continuar",
          confirmButtonColor: "#2563eb",
          customClass: {
            popup: "checkout-swal-popup",
            title: "checkout-swal-title",
            confirmButton: "checkout-swal-confirm",
          },
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "¡Pedido generado correctamente!",
          html: `
            <div style="line-height:1.8; text-align:left;">
              <div><strong>Método:</strong> ${paymentLabels[metodo]}</div>
              <div style="margin-top:10px; color:#475569;">
                Tu pedido quedó registrado y pendiente de confirmación de pago.
              </div>
            </div>
          `,
          confirmButtonText: "Continuar",
          confirmButtonColor: "#2563eb",
          customClass: {
            popup: "checkout-swal-popup",
            title: "checkout-swal-title",
            confirmButton: "checkout-swal-confirm",
          },
        });
      }

      navigate("/tienda/gracias", {
        state: {
          ticketCode: ticket?.code,
          paymentMethod: metodo,
          paymentStatus: paymentStatusLabels[metodo],
        },
      });
    } catch (e) {
      await showPrettyError(
        "No pudimos procesar la compra",
        e?.response?.data?.error || e.message || "Ocurrió un error inesperado."
      );
    }
  };

  const pay = async () => {
    if (!items.length) return;

    if (isMercadoPagoMode) {
      await payWithMercadoPago();
      return;
    }

    await payOffline();
  };

  if (!cart) return <p className="checkout-loading">Cargando checkout…</p>;

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <Link className="checkout-back" to="/tienda/carrito">
          Volver al carrito
        </Link>
      </div>

      {!items.length ? (
        <section className="checkout-empty">
          <h3>No tenés productos para pagar</h3>
          <p>Agregá libros al carrito y volvé al checkout.</p>
          <Link to="/tienda/libros" className="btn-primary">
            Ir a libros
          </Link>
        </section>
      ) : (
        <section className="checkout-layout">
          <section className="pay-card">
            <h3>1) Elegí tu medio de pago</h3>

            <div className="pay-methods pay-methods-grid">
              <button
                type="button"
                className={`pay-method pay-method-card ${
                  metodo === "card_credit" ? "active" : ""
                }`}
                onClick={() => setMetodo("card_credit")}
              >
                <span className="pay-method-title">💳 Tarjeta de crédito</span>
                <span className="pay-method-text">
                  Elegí cuotas y continuá con el cobro seguro en Mercado Pago.
                </span>
              </button>

              <button
                type="button"
                className={`pay-method pay-method-card ${
                  metodo === "card_debit" ? "active" : ""
                }`}
                onClick={() => setMetodo("card_debit")}
              >
                <span className="pay-method-title">💳 Tarjeta de débito</span>
                <span className="pay-method-text">
                  Continuá con el pago protegido en Mercado Pago.
                </span>
              </button>

              <button
                type="button"
                className={`pay-method pay-method-card ${
                  metodo === "mercadopago" ? "active" : ""
                }`}
                onClick={() => setMetodo("mercadopago")}
              >
                <span className="pay-method-title">🟦 Mercado Pago</span>
                <span className="pay-method-text">
                  Elegí saldo, tarjetas u otras opciones disponibles.
                </span>
              </button>

              <button
                type="button"
                className={`pay-method pay-method-card ${
                  metodo === "transfer" ? "active" : ""
                }`}
                onClick={() => setMetodo("transfer")}
              >
                <span className="pay-method-title">🏦 Transferencia</span>
                <span className="pay-method-text">
                  Realizás la transferencia y luego retirás en el local.
                </span>
              </button>

              <button
                type="button"
                className={`pay-method pay-method-card ${
                  metodo === "cash" ? "active" : ""
                }`}
                onClick={() => setMetodo("cash")}
              >
                <span className="pay-method-title">💵 Efectivo</span>
                <span className="pay-method-text">
                  Confirmás el pedido y abonás al retirar.
                </span>
              </button>
            </div>

            {metodo === "card_credit" && (
              <div className="pay-panel">
                <h4 className="pay-panel-title">Pago con tarjeta de crédito</h4>

                <div className="card-form">
                  <div className="row">
                    <div className="field">
                      <label>Nombre</label>
                      <input
                        value={creditForm.name}
                        onChange={(e) =>
                          handleCreditChange("name", e.target.value)
                        }
                        placeholder="Nombre del titular"
                      />
                    </div>

                    <div className="field">
                      <label>Apellido</label>
                      <input
                        value={creditForm.lastName}
                        onChange={(e) =>
                          handleCreditChange("lastName", e.target.value)
                        }
                        placeholder="Apellido del titular"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Cuotas</label>
                    <select
                      value={creditForm.installments}
                      onChange={(e) =>
                        handleCreditChange("installments", e.target.value)
                      }
                    >
                      <option value="1">1 cuota</option>
                      <option value="3">3 cuotas</option>
                      <option value="6">6 cuotas</option>
                      <option value="9">9 cuotas</option>
                      <option value="12">12 cuotas</option>
                    </select>
                  </div>

                  <p className="hint">
                    Los datos sensibles de la tarjeta se cargan directamente en el entorno
                    seguro de Mercado Pago.
                  </p>
                </div>
              </div>
            )}

            {metodo === "card_debit" && (
              <div className="pay-panel">
                <h4 className="pay-panel-title">Pago con tarjeta de débito</h4>

                <div className="card-form">
                  <div className="row">
                    <div className="field">
                      <label>Nombre</label>
                      <input
                        value={debitForm.name}
                        onChange={(e) =>
                          handleDebitChange("name", e.target.value)
                        }
                        placeholder="Nombre del titular"
                      />
                    </div>

                    <div className="field">
                      <label>Apellido</label>
                      <input
                        value={debitForm.lastName}
                        onChange={(e) =>
                          handleDebitChange("lastName", e.target.value)
                        }
                        placeholder="Apellido del titular"
                      />
                    </div>
                  </div>

                  <p className="hint">
                    Vas a completar el pago en el entorno seguro de Mercado Pago.
                  </p>
                </div>
              </div>
            )}

            {metodo === "mercadopago" && (
              <div className="pay-panel">
                <h4 className="pay-panel-title">Pagar con Mercado Pago</h4>
                <div className="mp-box">
                  <p>
                    Continuás en Mercado Pago para elegir entre los medios disponibles:
                    saldo, tarjetas y otras opciones habilitadas.
                  </p>
                  <p className="hint">
                    Es la opción más directa si querés resolver el pago desde la plataforma.
                  </p>
                </div>
              </div>
            )}

            {metodo === "transfer" && (
              <div className="pay-panel">
                <h4 className="pay-panel-title">Transferencia bancaria</h4>
                <div className="transfer-box">
                  <p>
                    Primero realizás la transferencia y luego, con la confirmación del pago,
                    retirás el pedido en el local.
                  </p>
                  <ul>
                    <li>CBU: 0000003100000000000000</li>
                    <li>Alias: THE.LIBRARY.PAGOS</li>
                    <li>Banco: The Library Bank</li>
                  </ul>
                  <p className="hint">
                    Usá tu email o el número de ticket como referencia para identificar el pago.
                  </p>
                </div>
              </div>
            )}

            {metodo === "cash" && (
              <div className="pay-panel">
                <h4 className="pay-panel-title">Pago en efectivo</h4>
                <div className="cash-box">
                  <p>
                    Confirmás ahora el pedido y abonás en efectivo cuando pases a retirarlo.
                  </p>
                  <p className="hint">
                    Conservá tu ticket para presentar al momento del retiro.
                  </p>
                </div>
              </div>
            )}

            <button
              className="pay-btn"
              disabled={loading || redirectingMP}
              onClick={pay}
            >
              {redirectingMP
                ? "Redirigiendo…"
                : loading
                ? "Procesando…"
                : isMercadoPagoMode
                ? "Continuar con el pago"
                : `Confirmar ${total.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}`}
            </button>

            <p className="secure">
              ✅ Protección al comprador • 🔐 Conexión segura • 📧 Ticket por email
            </p>
          </section>

          <aside className="resume-card">
            <h3>2) Resumen</h3>

            <div className="mini-list">
              {items.slice(0, 4).map((it) => (
                <div className="mini-item" key={it.prodId}>
                  <img src={it.imagen} alt={it.nombre} />
                  <div>
                    <p className="mini-title">{it.nombre}</p>
                    <p className="mini-meta">
                      {it.quantity} × ${it.precio.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
              {items.length > 4 && (
                <p className="mini-more">+{items.length - 4} producto(s) más</p>
              )}
            </div>

            <div className="sum">
              <div className="sum-row">
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString("es-AR")}</strong>
              </div>
              <div className="sum-row">
                <span>Envío</span>
                <strong>{envio === 0 ? "Gratis" : `$${envio}`}</strong>
              </div>
              <div className="sum-total">
                <span>Total</span>
                <strong>${total.toLocaleString("es-AR")}</strong>
              </div>
            </div>

            <div className="help">
              <p className="help-title">¿Necesitás ayuda?</p>
              <p className="help-text">
                Te enviamos el comprobante y el detalle de tu pedido al finalizar.
              </p>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
};