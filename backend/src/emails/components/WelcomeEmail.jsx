import * as React from "react";
import {
  Html, Head, Preview, Body, Container,
  Text, Button, Section, Heading
} from "@react-email/components";

export default function WelcomeEmail({ first_name = "Usuario", loginUrl }) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Mi App 🚀</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 }}>
          <Heading style={{ marginBottom: 8 }}>¡Hola {first_name}!</Heading>
          <Text style={{ marginBottom: 12 }}>
            Gracias por registrarte en Mi App. Nos alegra que estés aquí.
          </Text>
          <Section style={{ margin: "12px 0" }}>
            <Button href={loginUrl}>Iniciar sesión</Button>
          </Section>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            Si no has creado esta cuenta, ignora este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
