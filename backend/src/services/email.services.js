import { Resend } from "resend";
import path from "path";
import { pathToFileURL } from "url";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Import dinámico de template compilado
const importCompiled = async (basename) => {
  const filename = basename.endsWith(".js") ? basename : `${basename}.js`;
  const file = path.resolve(process.cwd(), "dist", "emails", filename); // 👈 dist/emails
  const mod = await import(pathToFileURL(file).href);
  if (!mod.renderEmail) throw new Error(`Template ${basename} no exporta renderEmail`);
  return mod.renderEmail;
};

// Bienvenida
export const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
      return;
    }
    const renderEmail = await importCompiled("welcome.entry");
    const html = renderEmail({
      first_name: user.first_name ?? user.name ?? "Usuario",
      loginUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
    });

    return await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Bienvenido a Mi App 🎉",
      html,
    });
  } catch (err) {
    console.error("❌ Error en sendWelcomeEmail:", err.message);
  }
};

// Compra
export const sendPurchaseEmail = async ({ user, ticket }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY no configurada, no se enviará el email");
      return;
    }
    const renderEmail = await importCompiled("purchase.entry");
    const html = renderEmail({
      first_name: user.first_name ?? user.name ?? "Cliente",
      ticket,
    });

    return await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Confirmación de compra - ${ticket.code}`,
      html,
    });
  } catch (err) {
    console.error("❌ Error en sendPurchaseEmail:", err.message);
  }
};

