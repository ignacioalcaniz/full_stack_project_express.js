// src/Middlewares/password.policy.js
import zxcvbn from "zxcvbn";

/**
 * Lanza error si la contraseña es débil.
 * Recomendado score >= 3 (0..4)
 */
export function enforceStrongPassword(password) {
  const result = zxcvbn(password || "");
  if (result.score < 3) {
    const suggestions = (result.feedback?.suggestions || []).join(" ");
    const warning = result.feedback?.warning || "";
    const tip = [warning, suggestions].filter(Boolean).join(" ");
    const msg = tip || "La contraseña es demasiado débil. Usa mayor longitud y entropía.";
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }
  return true;
}
