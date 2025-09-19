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
  Button,
  Section,
  Heading,
  Img
} from "@react-email/components";
function WelcomeEmail({ first_name = "Usuario", loginUrl }) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(Head, null), /* @__PURE__ */ React.createElement(Preview, null, "Bienvenido a The Library \u{1F680}"), /* @__PURE__ */ React.createElement(Body, { style: { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" } }, /* @__PURE__ */ React.createElement(Container, { style: { margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 } }, /* @__PURE__ */ React.createElement(Img, { src: "https://thelibraryyy.netlify.app/img/manual.ico", alt: "The Library Logo", width: 80, style: { display: "block", margin: "0 auto 20px auto" } }), /* @__PURE__ */ React.createElement(Heading, { style: { marginBottom: 8 } }, "\xA1Hola ", first_name, "!"), /* @__PURE__ */ React.createElement(Text, { style: { marginBottom: 12 } }, "Gracias por registrarte en ", /* @__PURE__ */ React.createElement("strong", null, "The Library"), ". Nos alegra que est\xE9s aqu\xED."), /* @__PURE__ */ React.createElement(Text, { style: { marginBottom: 12 } }, "Explora nuestros libros, busca tus favoritos y realiza tu primera compra de forma sencilla."), /* @__PURE__ */ React.createElement(Section, { style: { margin: "12px 0" } }, /* @__PURE__ */ React.createElement(Button, { href: loginUrl, style: { backgroundColor: "#4f46e5", color: "#fff", borderRadius: 4, padding: "10px 20px", textDecoration: "none" } }, "Iniciar sesi\xF3n")), /* @__PURE__ */ React.createElement(Container, { style: { marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 12 } }, /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280" } }, "The Library | Tu librer\xEDa online de confianza"), /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280", margin: "4px 0" } }, "Contacto: ", /* @__PURE__ */ React.createElement("a", { href: "mailto:contacto@thelibrary.com", style: { color: "#4f46e5", textDecoration: "none" } }, "contacto@thelibrary.com")), /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 12, color: "#6b7280" } }, "S\xEDguenos:", /* @__PURE__ */ React.createElement("a", { href: "https://facebook.com/thelibrary", style: { color: "#4f46e5", textDecoration: "none", marginLeft: 4 } }, "Facebook"), " |", /* @__PURE__ */ React.createElement("a", { href: "https://twitter.com/thelibrary", style: { color: "#4f46e5", textDecoration: "none", marginLeft: 4 } }, "Twitter"), " |", /* @__PURE__ */ React.createElement("a", { href: "https://instagram.com/thelibrary", style: { color: "#4f46e5", textDecoration: "none", marginLeft: 4 } }, "Instagram")), /* @__PURE__ */ React.createElement(Text, { style: { fontSize: 10, color: "#9ca3af", marginTop: 8 } }, "Si no has creado esta cuenta, ignora este correo.")))));
}

// src/emails/entries/welcome.entry.js
function renderEmail(props = {}) {
  return render(/* @__PURE__ */ React2.createElement(WelcomeEmail, { ...props }));
}
export {
  renderEmail
};
