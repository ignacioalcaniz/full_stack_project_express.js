import * as React from "react"; 
import {
  Html, Head, Preview, Body, Container,
  Text, Button, Section, Heading, Img
} from "@react-email/components";

export default function WelcomeEmail({ first_name = "Usuario", loginUrl }) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a The Library 🚀</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 }}>
          <Img src="https://thelibraryyy.netlify.app/img/manual.ico" alt="The Library Logo" width={80} style={{ display: 'block', margin: '0 auto 20px auto' }}/>
          <Heading style={{ marginBottom: 8 }}>¡Hola {first_name}!</Heading>
          <Text style={{ marginBottom: 12 }}>
            Gracias por registrarte en <strong>The Library</strong>. Nos alegra que estés aquí.
          </Text>
          <Text style={{ marginBottom: 12 }}>
            Explora nuestros libros, busca tus favoritos y realiza tu primera compra de forma sencilla.
          </Text>
          <Section style={{ margin: "12px 0" }}>
            <Button href={loginUrl} style={{ backgroundColor: "#4f46e5", color: "#fff", borderRadius: 4, padding: "10px 20px", textDecoration: "none" }}>
              Iniciar sesión
            </Button>
          </Section>

          {/* Footer corporativo */}
          <Container style={{ marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>The Library | Tu librería online de confianza</Text>
            <Text style={{ fontSize: 12, color: "#6b7280", margin: "4px 0" }}>
              Contacto: <a href="mailto:contacto@thelibrary.com" style={{ color: "#4f46e5", textDecoration: "none" }}>contacto@thelibrary.com</a>
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              Síguenos: 
              <a href="https://facebook.com/thelibrary" style={{ color: "#4f46e5", textDecoration: "none", marginLeft: 4 }}>Facebook</a> | 
              <a href="https://twitter.com/thelibrary" style={{ color: "#4f46e5", textDecoration: "none", marginLeft: 4 }}>Twitter</a> | 
              <a href="https://instagram.com/thelibrary" style={{ color: "#4f46e5", textDecoration: "none", marginLeft: 4 }}>Instagram</a>
            </Text>
            <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 8 }}>
              Si no has creado esta cuenta, ignora este correo.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

