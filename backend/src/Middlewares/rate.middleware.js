// src/Middlewares/rate.middleware.js
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const windowMs = Number(process.env.RATE_WINDOW_MS || 60_000); // 1 min
const maxReq  = Number(process.env.RATE_MAX || 100);          // 100 req/min
const delayAfter = Number(process.env.SLOWDOWN_AFTER || 50);  // luego de 50 req
const delayMs = Number(process.env.SLOWDOWN_MS || 250);       // +250ms por req extra

export const limiter = rateLimit({
  windowMs,
  max: maxReq,
  standardHeaders: true,
  legacyHeaders: false,
});

export const speedLimiter = slowDown({
  windowMs,
  delayAfter,
  delayMs: () => delayMs,
});
