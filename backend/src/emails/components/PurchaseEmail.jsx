import * as React from "react";
import {
  Html, Head, Preview, Body, Container,
  Text, Heading, Row, Column
} from "@react-email/components";

export default function PurchaseEmail({ first_name = "Cliente", ticket }) {
  return (
    <Html>
      <Head />
      <Preview>Confirmación de compra — {ticket?.code}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 }}>
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

          <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>
            Si necesitas asistencia, contactanos.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
