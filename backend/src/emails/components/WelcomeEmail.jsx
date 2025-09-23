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

export default function WelcomeEmail({
  first_name = "Usuario",
  loginUrl = "http://localhost:3000/login",
}) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a The Library 🚀</Preview>
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
          {/* Logo */}
          <Img
            src="https://thelibraryyy.netlify.app/img/manual.ico"
            alt="The Library Logo"
            width={80}
            style={{ display: "block", margin: "0 auto 20px auto" }}
          />

          {/* Encabezado */}
          <Heading style={{ textAlign: "center", marginBottom: 20 }}>
            👋 ¡Bienvenido {first_name}!
          </Heading>
          <Text style={{ marginBottom: 12, textAlign: "center" }}>
            Gracias por registrarte en <strong>The Library</strong>.  
            Estamos muy felices de que formes parte de nuestra comunidad.
          </Text>
          <Text style={{ marginBottom: 12, textAlign: "center" }}>
            Explora nuestro catálogo, encuentra tus libros favoritos y disfruta
            de una experiencia de compra sencilla y rápida.
          </Text>

          {/* Botón */}
          <Container style={{ textAlign: "center", margin: "20px 0" }}>
            <Button
              href={loginUrl}
              style={{
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: 6,
                padding: "12px 24px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Iniciar sesión
            </Button>
          </Container>

          {/* Footer corporativo */}
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
            <Text style={{ fontSize: 12, color: "#6b7280", margin: "4px 0" }}>
              Contacto:{" "}
              <a
                href="mailto:contacto@thelibrary.com"
                style={{ color: "#4f46e5", textDecoration: "none" }}
              >
                contacto@thelibrary.com
              </a>
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              Síguenos:
              <a
                href="https://facebook.com/thelibrary"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  marginLeft: 4,
                }}
              >
                Facebook
              </a>{" "}
              |{" "}
              <a
                href="https://twitter.com/thelibrary"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  marginLeft: 4,
                }}
              >
                Twitter
              </a>{" "}
              |{" "}
              <a
                href="https://instagram.com/thelibrary"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  marginLeft: 4,
                }}
              >
                Instagram
              </a>
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#9ca3af",
                marginTop: 8,
              }}
            >
              Si no creaste esta cuenta, puedes ignorar este correo.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}


