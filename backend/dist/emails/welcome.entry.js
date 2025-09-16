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
  Heading
} from "@react-email/components";
function WelcomeEmail({ first_name = "Usuario", loginUrl }) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(Head, null), /* @__PURE__ */ React.createElement(Preview, null, "Bienvenido a Mi App \u{1F680}"), /* @__PURE__ */ React.createElement(Body, { style: { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" } }, /* @__PURE__ */ React.createElement(Container, { style: { margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8, maxWidth: 600 } }, /* @__PURE__ */ React.createElement(Heading, { style: { marginBottom: 8 } }, "\xA1Hola ", first_name, "!"), /* @__PURE__ */ React.createElement(Text, { style: { marginBottom: 12 } }, "Gracias por registrarte en Mi App. Nos alegra que est\xE9s aqu\xED."), /* @__PURE__ */ React.createElement(Section, { style: { margin: "12px 0" } }, /* @__PURE__ */ React.createElement(Button, { href: loginUrl }, "Iniciar sesi\xF3n")), /* @__PURE__ */ React.createElement(Text, { style: { color: "#6b7280", fontSize: 12 } }, "Si no has creado esta cuenta, ignora este correo."))));
}

// src/emails/entries/welcome.entry.js
function renderEmail(props = {}) {
  return render(/* @__PURE__ */ React2.createElement(WelcomeEmail, { ...props }));
}
export {
  renderEmail
};
