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
  Column,
  Img,
  Button
} from "@react-email/components";
function PurchaseEmail({
  first_name = "Cliente",
  purchaserEmail,
  ticket
}) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(Head, null), /* @__PURE__ */ React.createElement(Preview, null, "Confirmaci\xF3n de compra \u2014 ", ticket?.code), /* @__PURE__ */ React.createElement(
    Body,
    {
      style: {
        backgroundColor: "#f4f4f5",
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0
      }
    },
    /* @__PURE__ */ React.createElement(
      Container,
      {
        style: {
          margin: "20px auto",
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 8,
          maxWidth: 650,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }
      },
      /* @__PURE__ */ React.createElement(
        Img,
        {
          src: "https://thelibraryyy.netlify.app/img/manual.ico",
          alt: "The Library Logo",
          width: 80,
          style: { display: "block", margin: "0 auto 20px auto" }
        }
      ),
      /* @__PURE__ */ React.createElement(Heading, { style: { textAlign: "center", marginBottom: 20 } }, "\u{1F389} \xA1Compra confirmada!"),
      /* @__PURE__ */ React.createElement(Text, null, "Hola ", /* @__PURE__ */ React.createElement("strong", null, first_name), ", gracias por tu compra en", " ", /* @__PURE__ */ React.createElement("strong", null, "The Library"), "."),
      /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Email del comprador:"), " ", ticket.purchaser),
      /* @__PURE__ */ React.createElement(
        Container,
        {
          style: {
            marginTop: 20,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 6
          }
        },
        /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Ticket:"), " ", ticket.code),
        /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement("strong", null, "Fecha:"), " ", new Date(ticket.purchase_datetime).toLocaleString())
      ),
      /* @__PURE__ */ React.createElement(Heading, { style: { fontSize: 16, marginTop: 20 } }, "\u{1F6D2} Detalle de productos"),
      ticket.products?.map((p, i) => /* @__PURE__ */ React.createElement(
        Row,
        {
          key: i,
          style: {
            marginBottom: 12,
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 12
          }
        },
        /* @__PURE__ */ React.createElement(Column, { style: { width: "20%", paddingRight: 10 } }, /* @__PURE__ */ React.createElement(
          Img,
          {
            src: p.image,
            alt: p.title,
            width: 70,
            style: { borderRadius: 6 }
          }
        )),
        /* @__PURE__ */ React.createElement(Column, { style: { width: "60%" } }, /* @__PURE__ */ React.createElement(Text, { style: { fontWeight: "bold" } }, p.title), /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280" } }, p.description), /* @__PURE__ */ React.createElement(Text, null, "Cantidad: ", p.quantity), /* @__PURE__ */ React.createElement(Text, null, "Precio unitario: $", p.price)),
        /* @__PURE__ */ React.createElement(Column, { style: { width: "20%", textAlign: "right" } }, /* @__PURE__ */ React.createElement(Text, { style: { fontWeight: "bold" } }, "$", p.price * p.quantity))
      )),
      /* @__PURE__ */ React.createElement(
        Container,
        {
          style: {
            marginTop: 20,
            padding: 12,
            background: "#eef2ff",
            borderRadius: 6,
            textAlign: "right"
          }
        },
        /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a" } }, "Total: $", ticket.amount)
      ),
      /* @__PURE__ */ React.createElement(Container, { style: { textAlign: "center", marginTop: 20 } }, /* @__PURE__ */ React.createElement(
        Button,
        {
          href: `${process.env.FRONTEND_URL || "http://localhost:3000"}/orders/${ticket.code}`,
          style: {
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: 4,
            padding: "10px 20px",
            textDecoration: "none",
            fontWeight: "bold"
          }
        },
        "Ver mi compra"
      )),
      /* @__PURE__ */ React.createElement(
        Container,
        {
          style: {
            marginTop: 30,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 12,
            textAlign: "center"
          }
        },
        /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280" } }, "The Library | Tu librer\xEDa online de confianza"),
        /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280", margin: "4px 0" } }, "Contacto:", " ", /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "mailto:contacto@thelibrary.com",
            style: { color: "#4f46e5", textDecoration: "none" }
          },
          "contacto@thelibrary.com"
        )),
        /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280" } }, "S\xEDguenos:", /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "https://facebook.com/thelibrary",
            style: {
              color: "#4f46e5",
              textDecoration: "none",
              marginLeft: 4
            }
          },
          "Facebook"
        ), " ", "|", " ", /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "https://twitter.com/thelibrary",
            style: {
              color: "#4f46e5",
              textDecoration: "none",
              marginLeft: 4
            }
          },
          "Twitter"
        ), " ", "|", " ", /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "https://instagram.com/thelibrary",
            style: {
              color: "#4f46e5",
              textDecoration: "none",
              marginLeft: 4
            }
          },
          "Instagram"
        )),
        /* @__PURE__ */ React.createElement(
          Text,
          {
            style: {
              fontSize: 10,
              color: "#9ca3af",
              marginTop: 8
            }
          },
          "Si necesitas asistencia, cont\xE1ctanos."
        )
      )
    )
  ));
}

// src/emails/entries/purchase.entry.js
function renderEmail(props = {}) {
  return render(/* @__PURE__ */ React2.createElement(PurchaseEmail, { ...props }));
}
var purchase_entry_default = PurchaseEmail;
export {
  purchase_entry_default as default,
  renderEmail
};
