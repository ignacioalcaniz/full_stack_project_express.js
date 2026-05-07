export default async function renderEmail({
  first_name = "Usuario",
  resetUrl = "https://www.thelibrarystore.it.com/reset-password",
  expiresMinutes = 15,
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f5; padding:24px; color:#111827;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:14px; padding:28px; border:1px solid #e5e7eb;">
        <div style="text-align:center; margin-bottom:24px;">
          <img src="https://www.thelibrarystore.it.com/logo192.png" alt="The Library" width="72" />
        </div>

        <h1 style="font-size:24px; text-align:center; margin:0 0 16px;">
          Recuperá tu contraseña
        </h1>

        <p style="font-size:15px; line-height:1.6;">
          Hola <strong>${first_name}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>The Library</strong>.
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
}

