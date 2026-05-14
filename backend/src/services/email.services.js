import { Resend } from "resend";
import path from "path";
import { pathToFileURL } from "url";
import { render } from "@react-email/render";
import "dotenv/config";

const DISABLE_EMAILS =
  process.env.DISABLE_EMAILS === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.CI === "true";

if (DISABLE_EMAILS) {
  console.log("📨 Email service deshabilitado (CI/ZAP/Test)");
}

let resend;

if (DISABLE_EMAILS) {
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
  resend = new Resend(process.env.RESEND_API_KEY);
}

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
  if (!Component) {
    throw new Error(`Template ${basename} no exporta default ni renderEmail`);
  }

  return Component;
};

const generateHtml = async (Component, data) => {
  if (Component.name && Component.name[0] === Component.name[0].toUpperCase()) {
    return render(Component(data));
  }

  return await Component(data);
};

export const sendWelcomeEmail = async (user) => {
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
    loginUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
  };

  const html = await generateHtml(Component, templateData);

  const payload = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Bienvenido a The Library",
    html,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email de bienvenida enviado:", result);
  return result;
};

export const sendPurchaseEmail = async ({
  user,
  ticket,
  rejectedProducts = [],
}) => {
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
    rejectedProducts,
  };

  const html = await generateHtml(Component, templateData);

  const payload = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject:
      rejectedProducts.length > 0
        ? `Compra parcial - ${ticket.code}`
        : `Confirmación de compra - ${ticket.code}`,
    html,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email de compra enviado:", result);
  return result;
};

export const sendEmailOtp = async ({
  email,
  first_name,
  code,
  reason = "verificación de acceso",
}) => {
  if (DISABLE_EMAILS) {
    console.log("📨 [MOCK] sendEmailOtp omitido por DISABLE_EMAILS");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ RESEND_API_KEY no configurada, no se enviará el email OTP"
    );
    return;
  }

  const safeName = first_name || "Usuario";
  const safeReason = reason || "verificación de acceso";

  const subject = "Tu código de acceso";

  const text = [
    "THE LIBRARY",
    "",
    `Hola ${safeName},`,
    "",
    `Tu código es: ${code}`,
    "",
    "Este código vence en 10 minutos.",
    `Motivo: ${safeReason}.`,
    "",
    "Si no solicitaste este código, ignorá este mensaje.",
    "",
    "THE LIBRARY",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; background: #ffffff; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
        <p style="margin: 0 0 16px; font-size: 14px; color: #374151;">THE LIBRARY</p>

        <p style="margin: 0 0 12px; font-size: 15px; color: #111827;">
          Hola ${safeName},
        </p>

        <p style="margin: 0 0 12px; font-size: 15px; color: #111827;">
          Tu código de acceso es:
        </p>

        <p style="margin: 0 0 16px; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #111827;">
          ${code}
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #4b5563;">
          Este código vence en 10 minutos.
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #4b5563;">
          Motivo: ${safeReason}.
        </p>

        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Si no solicitaste este código, ignorá este mensaje.
        </p>
      </div>
    </div>
  `;

  const payload = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
    text,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email OTP enviado:", result);
  return result;
};

export const sendResetPasswordEmail = async ({
  email,
  first_name,
  resetUrl,
  expiresMinutes = 15,
}) => {
  if (DISABLE_EMAILS) {
    console.log("📨 [MOCK] sendResetPasswordEmail omitido por DISABLE_EMAILS");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ RESEND_API_KEY no configurada, no se enviará el email de recuperación"
    );
    return;
  }

  const safeName = first_name || "Usuario";

  const text = [
    "THE LIBRARY",
    "",
    `Hola ${safeName},`,
    "",
    "Recibimos una solicitud para restablecer tu contraseña.",
    "",
    `Abrí este enlace: ${resetUrl}`,
    "",
    `El enlace vence en ${expiresMinutes} minutos.`,
    "",
    "Si no solicitaste este cambio, ignorá este correo.",
    "",
    "THE LIBRARY",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f5; padding:24px; color:#111827;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:14px; padding:28px; border:1px solid #e5e7eb;">
        <div style="text-align:center; margin-bottom:24px;">
          <img src="https://www.thelibrarystore.it.com/logo192.png" alt="The Library" width="72" />
        </div>

        <h1 style="font-size:24px; text-align:center; margin:0 0 16px;">
          Recuperá tu contraseña
        </h1>

        <p style="font-size:15px; line-height:1.6;">
          Hola <strong>${safeName}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>The Library</strong>.
        </p>

        <p style="font-size:15px; line-height:1.6;">
          Este enlace vence en <strong>${expiresMinutes} minutos</strong>.
        </p>

        <div style="text-align:center; margin:28px 0;">
          <a href="${resetUrl}" style="background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:10px; font-weight:700; display:inline-block;">
            Restablecer contraseña
          </a>
        </div>

        <p style="font-size:13px; color:#6b7280; line-height:1.6;">
          Si no solicitaste este cambio, podés ignorar este correo.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />

        <p style="font-size:12px; color:#6b7280; text-align:center;">
          The Library | Tu librería online de confianza
        </p>
      </div>
    </div>
  `;

  const payload = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Recuperá tu contraseña - The Library",
    html,
    text,
  };

  const result = await resend.emails.send(payload);
  console.log("✅ Email de recuperación enviado:", result);
  return result;
};


