import "./Gracias.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export const Gracias = () => {
  const location = useLocation();

  const [mpResult, setMpResult] = useState(null);
  const [loadingMp, setLoadingMp] = useState(false);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const ticketCode = location.state?.ticketCode;
  const paymentMethod = location.state?.paymentMethod || query.get("payment_method");
  const paymentStatus =
    location.state?.paymentStatus ||
    query.get("status") ||
    query.get("collection_status");

  const paymentId =
    query.get("payment_id") ||
    query.get("collection_id") ||
    query.get("paymentId");

  useEffect(() => {
    document.title = "Gracias por tu compra - THE LIBRARY";
  }, []);

  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) return;

      try {
        setLoadingMp(true);
        const res = await axiosClient.get(`/payments/status/${paymentId}`);
        setMpResult(res.data?.data || null);
      } catch {
        setMpResult(null);
      } finally {
        setLoadingMp(false);
      }
    };

    loadPayment();
  }, [paymentId]);

  const methodLabel = {
    card: "Mercado Pago",
    transfer: "Transferencia",
    cash: "Efectivo en local",
  };

  const resolvedMethod =
    paymentMethod === "card" || mpResult?.status ? "card" : paymentMethod;

  const statusLabel = {
    approved: "Pago aprobado",
    paid: "Pago confirmado",
    pending: "Pago pendiente",
    in_process: "Pago en proceso",
    rejected: "Pago rechazado",
  };

  const resolvedStatus =
    mpResult?.status || paymentStatus || null;

  return (
    <main className="gracias-container">
      <div className="gracias-card">
        <h2>¡Gracias por tu compra!</h2>

        {ticketCode ? (
          <>
            <p>
              Tu compra fue registrada correctamente. <br />
              <strong>Ticket:</strong> {ticketCode}
            </p>

            {resolvedMethod && (
              <p>
                <strong>Método de pago:</strong>{" "}
                {methodLabel[resolvedMethod] || resolvedMethod}
              </p>
            )}

            {resolvedStatus && (
              <p className="gracias-ticket">
                <strong>Estado:</strong>{" "}
                {statusLabel[resolvedStatus] || resolvedStatus}
              </p>
            )}
          </>
        ) : paymentId ? (
          <>
            <p>
              Estamos consultando el resultado de tu pago con Mercado Pago.
            </p>

            {loadingMp ? (
              <p className="gracias-ticket">Verificando pago…</p>
            ) : (
              <>
                <p>
                  <strong>Pago:</strong> #{paymentId}
                </p>

                {resolvedStatus && (
                  <p className="gracias-ticket">
                    <strong>Estado:</strong>{" "}
                    {statusLabel[resolvedStatus] || resolvedStatus}
                  </p>
                )}

                {resolvedStatus === "approved" && (
                  <p>
                    Tu pago fue aprobado. En instantes deberías ver la compra reflejada
                    en tu historial.
                  </p>
                )}

                {resolvedStatus === "pending" && (
                  <p>
                    Mercado Pago informó que el pago está pendiente. Te mostraremos la
                    actualización cuando impacte.
                  </p>
                )}

                {resolvedStatus === "rejected" && (
                  <p>
                    El pago fue rechazado. Podés volver al checkout e intentarlo otra vez.
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <p>
            Tu pedido está siendo procesado. En unos segundos recibirás un email
            con el ticket de compra.
          </p>
        )}

        <div className="gracias-actions">
          <Link to="/tienda/libros" className="gracias-btn">
            Seguir comprando
          </Link>
          <Link to="/tienda" className="gracias-btn secundary">
            Volver al inicio
          </Link>
        </div>

        <p className="gracias-note">
          📧 Te enviamos el detalle por email • 🔒 Compra protegida
        </p>
      </div>
    </main>
  );
};


