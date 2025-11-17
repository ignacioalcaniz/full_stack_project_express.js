// src/Middlewares/rate.middleware.js
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/* ------------------------------------------------------------------
   🔐 CONFIGURACIÓN BASE GLOBAL
------------------------------------------------------------------ */
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS) || 60_000; // 1 minuto
const RATE_LIMIT = Number(process.env.RATE_MAX) || 100; // requests máximos por IP
const SLOWDOWN_WINDOW_MS = Number(process.env.SLOWDOWN_WINDOW_MS) || 60_000;
const SLOWDOWN_AFTER = Number(process.env.SLOWDOWN_AFTER) || 50;
const SLOWDOWN_DELAY_MS = Number(process.env.SLOWDOWN_MS) || 250;

/* ------------------------------------------------------------------
   🚦 LIMITADOR GLOBAL DE REQUESTS (rate-limit)
------------------------------------------------------------------ */
export const limiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  limit: RATE_LIMIT, // en v8 el campo es "limit"
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes. Intentá nuevamente más tarde.",
  },
});

/* ------------------------------------------------------------------
   🐢 REDUCCIÓN PROGRESIVA DE VELOCIDAD (slow-down)
   🔸 se ejecuta después del rate-limit
------------------------------------------------------------------ */
export const speedLimiter = slowDown({
  windowMs: SLOWDOWN_WINDOW_MS,
  delayAfter: SLOWDOWN_AFTER, // cantidad de requests antes de retrasar
  delayMs: (used, req) => (used - SLOWDOWN_AFTER) * SLOWDOWN_DELAY_MS,
  validate: false, // <--- 🔥 evita conflicto de validaciones
});

/* ------------------------------------------------------------------
   🔐 LIMITADOR DE LOGIN Y REGISTRO (anti fuerza bruta / bots)
------------------------------------------------------------------ */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos de inicio de sesión. Esperá unos minutos e intentá de nuevo.",
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados registros desde esta IP. Intentá más tarde.",
  },
});





