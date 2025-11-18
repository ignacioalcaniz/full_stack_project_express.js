// src/services/email.services.js
import { Resend } from "resend";
import path from "path";
import { pathToFileURL } from "url";
import { render } from "@react-email/render";
import "dotenv/config";

/* ===========================================================
   🎯 Flag para desactivar mails en CI / ZAP / tests
   =========================================================== */
const DISABLE_EMAILS =
  process.env.DISABLE_EMAILS === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.CI === "true";

if (DISABLE_EMAILS) {
  console.log("📨 Email service deshabilitado (CI/ZAP/Test)");
}

/* ===========================================================
   🧰 Instancia de Resend
   - En CI/ZAP/Test → mock
   - En dev/prod sin API key → mock con warning
   - En dev/prod con API key → Resend real
   =========================================================== */
let resend;

if (DISABLE_EMAILS) {
  // Mock completo: nunca llama a la API externa
  resend = {
    emails: {
      send: async (payload) => {
        console.log("📨 [MOCK] Email omitido (DISABLE_EMAILS/CI/TEST)", {
          to: payload?.to,
          subject: payload?.subject,
        });
        return { id: "mocked-email", payload };
      },
    },
  };
} else if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️ RESEND_API_KEY no configurada. El servicio de email está deshabilitado."
  );
  // Mock de seguridad para que NUNCA reviente por constructor de Resend
  resend = {
    emails: {
      send: async (payload) => {
        console.warn(
          "⚠️ Intento de envío de email sin RESEND_API_KEY. Email omitido."
        );
        return { id: "no-api-key", payload };
      },
    },
  };
} else {
  // ✅ Camino real: producción / desarrollo con key válida
  resend = new Resend(process.env.RESEND_API_KEY);
}

/* ===========================================================
   Import dinámico de templates (PROD: dist/emails, DEV: src/emails/entries)
   =========================================================== */
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
  if (!Component)
    throw new Error(`Template ${basename} no exporta default ni renderEmail`);
  return Component;
};

/* ===========================================================
   Generar HTML a partir del template React / función
   =========================================================== */
const generateHtml = async (Component, data) => {
  if (Component.name && Component.name[0] === Component.name[0].toUpperCase()) {
    return render(Component(data));
  }
  return await Component(data);
};

/* ===========================================================
   Email de bienvenida
   =========================================================== */
export const sendWelcomeEmail = async (user) => {
  // 🔇 En CI/ZAP/Test → no enviamos
  if (DISABLE_EMAILS) {
    console.log("📨 [MOCK] sendWelcomeEmail omitido por DISABLE_EMAILS");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ RESEND_API_KEY no configurada, no se enviará el email de bienvenida"
    );
    return;
  }

  const Component = await importTemplate("welcome.entry");
  const templateData = {
    first_name: user.first_name ?? user.name ?? "Usuario",
    loginUrl: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/login`,
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

/* ===========================================================
   Email de compra / ticket
   =========================================================== */
export const sendPurchaseEmail = async ({ user, ticket }) => {
  // 🔇 En CI/ZAP/Test → no enviamos
  if (DISABLE_EMAILS) {
    console.log("📨 [MOCK] sendPurchaseEmail omitido por DISABLE_EMAILS");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ RESEND_API_KEY no configurada, no se enviará el email de compra"
    );
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
