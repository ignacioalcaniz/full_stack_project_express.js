// src/services/email.services.js
import { Resend } from "resend";
import path from "path";
import { pathToFileURL } from "url";
import { render } from "@react-email/render";
import "dotenv/config";

// ✅ Mock seguro para entorno de test
let resend;
if (process.env.NODE_ENV === "test") {
  resend = { emails: { send: async (payload) => ({ id: "mocked-email", payload }) } };
  console.log("🧪 Mock de Resend activo (modo test)");
} else {
  resend = new Resend(process.env.RESEND_API_KEY || "");
}

// Import dinámico de templates, detecta desarrollo o producción
const importTemplate = async (basename) => {
  const filename = basename.endsWith(".js") ? basename : `${basename}.js`;
  let file = path.resolve(process.cwd(), "dist", "emails", filename);
  let mod;

  try {
    mod = await import(pathToFileURL(file).href);
    console.log("📄 Template importado desde producción:", file);
  } catch {
    file = path.resolve(process.cwd(), "src", "emails", "entries", filename);
    mod = await import(pathToFileURL(file).href);
    console.log("📄 Template importado desde desarrollo:", file);
  }

  const Component = mod.default || mod.renderEmail;
  if (!Component) throw new Error(`Template ${basename} no exporta default ni renderEmail`);
  return Component;
};

// Genera HTML a partir del template
const generateHtml = async (Component, data) => {
  if (Component.name && Component.name[0] === Component.name[0].toUpperCase()) {
    return render(Component(data));
  }
  return await Component(data);
};

// Enviar email de bienvenida
export const sendWelcomeEmail = async (user) => {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "test") {
    console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
    return;
  }

  const Component = await importTemplate("welcome.entry");
  const templateData = {
    first_name: user.first_name ?? user.name ?? "Usuario",
    loginUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
  };
  const html = await generateHtml(Component, templateData);

  const payload = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Bienvenido a The Library 🚀",
    html,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email de bienvenida enviado:", result);
  return result;
};

// Enviar email de compra/ticket
export const sendPurchaseEmail = async ({ user, ticket }) => {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "test") {
    console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
    return;
  }

  const Component = await importTemplate("purchase.entry");
  const templateData = {
    first_name: user.first_name ?? user.name ?? "Cliente",
    ticket,
  };
  const html = await generateHtml(Component, templateData);

  const payload = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Confirmación de compra - ${ticket.code} 🎉`,
    html,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email de compra enviado:", result);
  return result;
};
