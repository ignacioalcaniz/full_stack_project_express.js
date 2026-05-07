import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Img,
  Button,
} from "@react-email/components";

export default function ResetPasswordEmail({
  first_name = "Usuario",
  resetUrl = "https://www.thelibrarystore.it.com/reset-password",
  expiresMinutes = 15,
}) {
  return (
    <Html>
      <Head />
      <Preview>Recuperá tu contraseña en The Library</Preview>
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
          <Img
            src="https://www.thelibrarystore.it.com/logo192.png"
            alt="The Library Logo"
            width={80}
            style={{ display: "block", margin: "0 auto 20px auto" }}
          />

          <Heading style={{ textAlign: "center", marginBottom: 20 }}>
            🔐 Recuperá tu contraseña
          </Heading>

          <Text style={{ marginBottom: 12, textAlign: "center" }}>
            Hola <strong>{first_name}</strong>, recibimos una solicitud para
            restablecer la contraseña de tu cuenta en <strong>The Library</strong>.
          </Text>

          <Text style={{ marginBottom: 12, textAlign: "center" }}>
            Este enlace vence en <strong>{expiresMinutes} minutos</strong>.
          </Text>

          <Container style={{ textAlign: "center", margin: "20px 0" }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: 6,
                padding: "12px 24px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Restablecer contraseña
            </Button>
          </Container>

          <Text style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
            Si no solicitaste este cambio, podés ignorar este correo.
          </Text>

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
          </Container>
        </Container>
      </Body>
    </Html>
  );
}