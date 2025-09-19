import * as React from "react"; 
import {
  Html, Head, Preview, Body, Container,
  Text, Heading, Row, Column, Img
} from "@react-email/components";

export default function PurchaseEmail({ first_name = "Cliente", ticket }) {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de compra — {ticket?.code}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 }}>
          <Img src="https://thelibraryyy.netlify.app/img/manual.ico" alt="The Library Logo" width={80} style={{ display: 'block', margin: '0 auto 20px auto' }}/>
          <Heading>Compra confirmada 🎉</Heading>
          <Text>Hola {first_name}, gracias por tu compra.</Text>

          <Text><strong>Ticket:</strong> {ticket.code}</Text>
          <Text><strong>Total:</strong> ${ticket.amount}</Text>
          <Text><strong>Fecha:</strong> {ticket.purchase_datetime}</Text>

          <Heading style={{ fontSize: 16, marginTop: 12 }}>Productos</Heading>
          {ticket.products?.map((p, i) => (
            <Row key={i} style={{ marginBottom: 8 }}>
              <Column style={{ width: "70%" }}>
                <Text>{p.title} (x{p.quantity})</Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text>${p.price}</Text>
              </Column>
            </Row>
          ))}

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
              Si necesitas asistencia, contactanos.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}
