// src/emails/entries/welcome.entry.js
import React2 from "react";
import { render } from "@react-email/render";

// src/emails/components/WelcomeEmail.jsx
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
  Button
} from "@react-email/components";
function WelcomeEmail({
  first_name = "Usuario",
  loginUrl = "http://localhost:3000/login"
}) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(Head, null), /* @__PURE__ */ React.createElement(Preview, null, "Bienvenido a The Library \u{1F680}"), /* @__PURE__ */ React.createElement(
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
      /* @__PURE__ */ React.createElement(Heading, { style: { textAlign: "center", marginBottom: 20 } }, "\u{1F44B} \xA1Bienvenido ", first_name, "!"),
      /* @__PURE__ */ React.createElement(Text, { style: { marginBottom: 12, textAlign: "center" } }, "Gracias por registrarte en ", /* @__PURE__ */ React.createElement("strong", null, "The Library"), ". Estamos muy felices de que formes parte de nuestra comunidad."),
      /* @__PURE__ */ React.createElement(Text, { style: { marginBottom: 12, textAlign: "center" } }, "Explora nuestro cat\xE1logo, encuentra tus libros favoritos y disfruta de una experiencia de compra sencilla y r\xE1pida."),
      /* @__PURE__ */ React.createElement(Container, { style: { textAlign: "center", margin: "20px 0" } }, /* @__PURE__ */ React.createElement(
        Button,
        {
          href: loginUrl,
          style: {
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: 6,
            padding: "12px 24px",
            textDecoration: "none",
            fontWeight: "bold"
          }
        },
        "Iniciar sesi\xF3n"
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
          "Si no creaste esta cuenta, puedes ignorar este correo."
        )
      )
    )
  ));
}

// src/emails/entries/welcome.entry.js
function renderEmail(props = {}) {
  return render(/* @__PURE__ */ React2.createElement(WelcomeEmail, { ...props }));
}
export {
  renderEmail
};
