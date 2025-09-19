// src/services/email.services.js
import { Resend } from "resend";
import path from "path";
import { pathToFileURL } from "url";
import { render } from "@react-email/render";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Import dinámico de template compilado
const importCompiled = async (basename) => {
  const filename = basename.endsWith(".js") ? basename : `${basename}.js`;

  // Intentar primero dist (producción)
  let file = path.resolve(process.cwd(), "dist", "emails", filename);
  let mod;
  try {
    console.log("📄 Intentando importar template desde dist:", file);
    mod = await import(pathToFileURL(file).href);
  } catch {
    // Si falla, usar src (desarrollo)
    file = path.resolve(process.cwd(), "src", "emails", "entries", filename);
    console.log("📄 Intentando importar template desde src:", file);
    mod = await import(pathToFileURL(file).href);
  }

  // Soporta export default o renderEmail
  const Component = mod.default || mod.renderEmail;
  if (!Component) {
    throw new Error(`Template ${basename} no exporta default ni renderEmail`);
  }

  console.log("🧩 Template cargado:", Component.name || "Sin nombre");
  return Component;
};

// Función para generar HTML de manera segura
const generateHtml = async (Component, templateData) => {
  // Si el template es un componente React (nombre con mayúscula inicial)
  if (Component.name && Component.name[0] === Component.name[0].toUpperCase()) {
    return render(Component(templateData));
  }
  // Si es una función renderEmail que ya devuelve string
  return await Component(templateData);
};

// Bienvenida
export const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
      return;
    }

    console.log("✉️ Preparando email de bienvenida para:", user.email);

    const Component = await importCompiled("welcome.entry");

    const templateData = {
      first_name: user.first_name ?? user.name ?? "Usuario",
      loginUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
    };
    console.log("📋 Datos para el template:", templateData);

    const html = await generateHtml(Component, templateData);
    console.log("📝 HTML generado para el email de bienvenida (longitud):", html.length);

    const emailPayload = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Bienvenido a The Library. The best bookshop in America! 🎉",
      html,
    };
    console.log("📤 Objeto enviado a Resend:", { ...emailPayload, html: "[HTML oculto]" });

    const result = await resend.emails.send(emailPayload);
    console.log("✅ Email de bienvenida enviado:", result);

    return result;
  } catch (err) {
    console.error("❌ Error en sendWelcomeEmail:", err);
  }
};

// Compra
export const sendPurchaseEmail = async ({ user, ticket }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
      return;
    }

    console.log("✉️ Preparando email de compra para:", user.email);

    const Component = await importCompiled("purchase.entry");

    const templateData = {
      first_name: user.first_name ?? user.name ?? "Cliente",
      ticket,
    };
    console.log("📋 Datos para el template de compra:", templateData);

    const html = await generateHtml(Component, templateData);
    console.log("📝 HTML generado para el email de compra (longitud):", html.length);

    const emailPayload = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Confirmación de compra - ${ticket.code}`,
      html,
    };
    console.log("📤 Objeto enviado a Resend:", { ...emailPayload, html: "[HTML oculto]" });

    const result = await resend.emails.send(emailPayload);
    console.log("✅ Email de compra enviado:", result);

    return result;
  } catch (err) {
    console.error("❌ Error en sendPurchaseEmail:", err);
  }
};




