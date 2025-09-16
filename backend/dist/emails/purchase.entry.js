// src/emails/entries/purchase.entry.js
import React2 from "react";
import { render } from "@react-email/render";

// src/emails/components/PurchaseEmail.jsx
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
  Column
} from "@react-email/components";
function PurchaseEmail({ first_name = "Cliente", ticket }) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(Head, null), /* @__PURE__ */ React.createElement(Preview, null, "Confirmaci\xF3n de compra \u2014 ", ticket?.code), /* @__PURE__ */ React.createElement(Body, { style: { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" } }, /* @__PURE__ */ React.createElement(Container, { style: { margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 } }, /* @__PURE__ */ React.createElement(Heading, null, "Compra confirmada \u{1F389}"), /* @__PURE__ */ React.createElement(Text, null, "Hola ", first_name, ", gracias por tu compra."), /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Ticket:"), " ", ticket.code), /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Total:"), " $", ticket.amount), /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Fecha:"), " ", ticket.purchase_datetime), /* @__PURE__ */ React.createElement(Heading, { style: { fontSize: 16, marginTop: 12 } }, "Productos"), ticket.products?.map((p, i) => /* @__PURE__ */ React.createElement(Row, { key: i, style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(Column, { style: { width: "70%" } }, /* @__PURE__ */ React.createElement(Text, null, p.title, " (x", p.quantity, ")")), /* @__PURE__ */ React.createElement(Column, { style: { width: "30%", textAlign: "right" } }, /* @__PURE__ */ React.createElement(Text, null, "$", p.price)))), /* @__PURE__ */ React.createElement(Text, { style: { color: "#6b7280", fontSize: 12, marginTop: 12 } }, "Si necesitas asistencia, contactanos."))));
}

// src/emails/entries/purchase.entry.js
function renderEmail(props = {}) {
  return render(/* @__PURE__ */ React2.createElement(PurchaseEmail, { ...props }));
}
export {
  renderEmail
};
