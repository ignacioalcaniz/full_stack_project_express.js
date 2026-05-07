// src/Middlewares/rate.middleware.js
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS) || 60_000;
const RATE_LIMIT_DEFAULT = Number(process.env.RATE_MAX) || 100;

const SLOWDOWN_WINDOW_MS = Number(process.env.SLOWDOWN_WINDOW_MS) || 60_000;
const SLOWDOWN_AFTER = Number(process.env.SLOWDOWN_AFTER) || 50;
const SLOWDOWN_DELAY_MS = Number(process.env.SLOWDOWN_MS) || 250;

const USE_REDIS_RATE_LIMIT = process.env.USE_REDIS_RATE_LIMIT === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const BYPASS_RATE_LIMIT =
  process.env.NODE_ENV === "test" ||
  process.env.CI === "true" ||
  process.env.ZAP_ENV === "true" ||
  process.env.DISABLE_RATE_LIMIT === "true";

let client;
let ready = false;
let connecting = false;

async function ensureRedis() {
  if (BYPASS_RATE_LIMIT) return false;
  if (!USE_REDIS_RATE_LIMIT) return false;
  if (ready) return true;
  if (connecting) return false;

  connecting = true;

  try {
    if (!client) {
      client = createClient({ url: REDIS_URL });

      client.on("ready", () => {
        ready = true;
      });

      client.on("end", () => {
        ready = false;
      });

      client.on("error", () => {
        ready = false;
      });
    }

    if (!client.isOpen) {
      await client.connect();
    }

    return ready;
  } catch {
    ready = false;
    return false;
  } finally {
    connecting = false;
  }
}

function getStore() {
  if (BYPASS_RATE_LIMIT) return undefined;
  if (!USE_REDIS_RATE_LIMIT || !client || !ready) return undefined;

  return new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  });
}

export const speedLimiter = (req, res, next) => {
  if (BYPASS_RATE_LIMIT) return next();

  return slowDown({
    windowMs: SLOWDOWN_WINDOW_MS,
    delayAfter: SLOWDOWN_AFTER,
    delayMs: (used) => (used - SLOWDOWN_AFTER) * SLOWDOWN_DELAY_MS,
    validate: false,
  })(req, res, next);
};

export const dynamicLimiter = async (req, res, next) => {
  if (BYPASS_RATE_LIMIT) return next();

  await ensureRedis();

  const maxFromSettings = Number(req.settings?.rateLimitMax);
  const max =
    Number.isFinite(maxFromSettings) && maxFromSettings > 0
      ? maxFromSettings
      : RATE_LIMIT_DEFAULT;

  return rateLimit({
    windowMs: RATE_WINDOW_MS,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore(),
    message: { error: "Demasiadas solicitudes. Intentá nuevamente más tarde." },
  })(req, res, next);
};

export const loginLimiter = (req, res, next) => {
  if (BYPASS_RATE_LIMIT) return next();

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
    },
  })(req, res, next);
};

export const registerLimiter = (req, res, next) => {
  if (BYPASS_RATE_LIMIT) return next();

  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Demasiados registros desde esta IP. Intentá más tarde.",
    },
  })(req, res, next);
};



