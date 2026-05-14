// src/Middlewares/password.policy.js
import zxcvbn from "zxcvbn";

function minScoreFor(policy) {
  const p = String(policy || "medium").toLowerCase();
  if (p === "weak") return 2;
  if (p === "strong") return 4;
  return 3; // medium
}

export function enforceStrongPassword(password, policy = "medium") {
  const result = zxcvbn(password || "");
  const minScore = minScoreFor(policy);

  if (result.score < minScore) {
    const suggestions = (result.feedback?.suggestions || []).join(" ");
    const warning = result.feedback?.warning || "";
    const tip = [warning, suggestions].filter(Boolean).join(" ");

    const label =
      String(policy).toLowerCase() === "strong"
        ? "strong"
        : String(policy).toLowerCase() === "weak"
        ? "weak"
        : "medium";

    const msg =
      tip ||
      `La contraseña es demasiado débil para policy "${label}". Usá más longitud y combiná letras/números/símbolos.`;

    const err = new Error(msg);
    err.status = 400;
    throw err;
  }

  return true;
}
