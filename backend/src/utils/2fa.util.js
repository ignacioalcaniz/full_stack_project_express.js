// src/utils/2fa.util.js
import { authenticator } from "otplib";
import qrcode from "qrcode";

/**
 * Genera un secreto y QR para Google Authenticator o Authy
 */
export function generate2FASecret(email) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "FullStackExpressApp", secret);
  return { secret, otpauth };
}

/**
 * Devuelve el QR en formato base64 para mostrar en el frontend
 */
export async function generate2FAQrDataUrl(otpauth) {
  return await qrcode.toDataURL(otpauth);
}

/**
 * Verifica el código TOTP del usuario
 */
export function verify2FAToken(secret, token) {
  return authenticator.verify({ secret, token });
}
