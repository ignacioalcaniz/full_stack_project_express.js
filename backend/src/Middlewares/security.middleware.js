// src/Middlewares/security.middleware.js
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import cors from "cors";
import express from "express";
import { ipKeyGenerator } from "express-rate-limit";
export const applySecurity = (app) => {
  app.use(helmet());

  // limitar tamaño de body JSON
  app.use(express.json({ limit: "10kb" }));

  // sanitización
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());

  // CORS seguro (permitir swagger / localhost / frontend)
  const allowed = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow tools like Postman / Swagger UI
        if (allowed.includes(origin) || allowed.includes("*")) return cb(null, true);
        return cb(new Error("CORS no permitido"), false);
      },
      credentials: true,
    })
  );

  // rate limit global
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // slowdown (nuevo API: delayMs puede ser función o número)
  const speedLimiter = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 50,
    delayMs: () => 200,
  });
  app.use(speedLimiter);

  app.use(compression());
};

// limiter específico para login (generador de clave seguro)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: "error",
    message: "Demasiados intentos de login. Intenta de nuevo más tarde.",
  },
  keyGenerator: (req, res) => {
    if (req.body?.email) return `login:${req.body.email.toLowerCase()}`;
    return ipKeyGenerator(req, res); // ✅ seguro para IPv6
  },
});
