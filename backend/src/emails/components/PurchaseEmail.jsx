import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Row,
  Column,
  Img,
  Button,
} from "@react-email/components";

const PLACEHOLDER_IMG =
  "https://via.placeholder.com/150?text=No+image";

export default function PurchaseEmail({
  first_name = "Cliente",
  ticket,
  rejectedProducts = [], // 👈 NUEVO (opcional, no rompe nada)
}) {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de compra — {ticket?.code}</Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            margin: "20px auto",
            padding: 20,
            backgroundColor: "#fff",
            borderRadius: 8,
            maxWidth: 650,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* LOGO */}
          <Img
            src="https://thelibraryyy.netlify.app/img/manual.ico"
            alt="The Library Logo"
            width={80}
            style={{ display: "block", margin: "0 auto 20px auto" }}
          />

          {/* HEADER */}
          <Heading style={{ textAlign: "center", marginBottom: 20 }}>
            🎉 ¡Compra confirmada!
          </Heading>

          <Text>
            Hola <strong>{first_name}</strong>, gracias por tu compra en{" "}
            <strong>The Library</strong>.
          </Text>

          <Text>
            <strong>Email del comprador:</strong> {ticket.purchaser}
          </Text>

          {/* INFO TICKET */}
          <Container
            style={{
              marginTop: 20,
              padding: 12,
              background: "#f9fafb",
              borderRadius: 6,
            }}
          >
            <Text>
              <strong>Ticket:</strong> {ticket.code}
            </Text>
            <Text>
              <strong>Fecha:</strong>{" "}
              {new Date(ticket.purchase_datetime).toLocaleString()}
            </Text>
          </Container>

          {/* DETALLE PRODUCTOS COMPRADOS */}
          <Heading style={{ fontSize: 16, marginTop: 20 }}>
            🛒 Detalle de productos comprados
          </Heading>

          {ticket.products?.map((p, i) => {
            const img = p.imagen || p.image || PLACEHOLDER_IMG;

            return (
              <Row
                key={i}
                style={{
                  marginBottom: 12,
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: 12,
                }}
              >
                <Column style={{ width: "20%", paddingRight: 10 }}>
                  <Img
                    src={img}
                    alt={p.title}
                    width={70}
                    style={{ borderRadius: 6 }}
                  />
                </Column>

                <Column style={{ width: "60%" }}>
                  <Text style={{ fontWeight: "bold" }}>{p.title}</Text>
                  <Text>Cantidad: {p.quantity}</Text>
                  <Text>Precio unitario: ${p.price}</Text>
                </Column>

                <Column style={{ width: "20%", textAlign: "right" }}>
                  <Text style={{ fontWeight: "bold" }}>
                    ${p.subtotal}
                  </Text>
                </Column>
              </Row>
            );
          })}

          {/* ⚠️ PRODUCTOS RECHAZADOS (NUEVO, PRO) */}
          {rejectedProducts.length > 0 && (
            <Container
              style={{
                marginTop: 20,
                padding: 12,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
              }}
            >
              <Heading style={{ fontSize: 16, color: "#b91c1c" }}>
                ⚠️ Algunos productos no pudieron comprarse
              </Heading>

              <Text style={{ fontSize: 13, color: "#7f1d1d" }}>
                Los siguientes productos no se incluyeron en la compra por
                falta de stock:
              </Text>

              {rejectedProducts.map((r, i) => (
                <Text key={i} style={{ fontSize: 13 }}>
                  • <strong>{r.title}</strong> — {r.reason}
                  {r.requested && (
                    <>
                      {" "}
                      (Solicitados: {r.requested}, Comprados:{" "}
                      {r.purchased})
                    </>
                  )}
                </Text>
              ))}
            </Container>
          )}

          {/* TOTAL */}
          <Container
            style={{
              marginTop: 20,
              padding: 12,
              background: "#eef2ff",
              borderRadius: 6,
              textAlign: "right",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1e3a8a",
              }}
            >
              Total: ${ticket.amount}
            </Text>
          </Container>

          {/* BOTÓN */}
          <Container style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              href={`${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/orders/${ticket.code}`}
              style={{
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: 4,
                padding: "10px 20px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Ver mi compra
            </Button>
          </Container>

          {/* FOOTER */}
          <Container
            style={{
              marginTop: 30,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 12,
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              The Library | Tu librería online de confianza
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              Si necesitas asistencia, contáctanos.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}






