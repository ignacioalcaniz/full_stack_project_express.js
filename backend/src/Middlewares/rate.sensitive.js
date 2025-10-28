// src/Middlewares/rate.sensitive.js
import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_SENSITIVE_WINDOW_MS || 60_000); // 1 min
const loginMax = Number(process.env.RATE_LOGIN_MAX || 5);
const registerMax = Number(process.env.RATE_REGISTER_MAX || 3);

export const loginLimiter = rateLimit({
  windowMs,
  max: loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de login. Esperá un minuto e intentá de nuevo." },
});

export const registerLimiter = rateLimit({
  windowMs,
  max: registerMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados registros desde esta IP. Intentá más tarde." },
});
