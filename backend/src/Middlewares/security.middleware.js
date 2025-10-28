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
  // Seguridad general
  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));

  // Sanitización
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());

  // CORS seguro (Swagger, localhost, frontend)
  const allowed = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // permite Postman / Swagger UI
        if (allowed.includes(origin) || allowed.includes("*")) return cb(null, true);
        return cb(new Error("CORS no permitido"), false);
      },
      credentials: true,
    })
  );

  // Rate limit global
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Slowdown (evita DoS suaves)
  const speedLimiter = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 50,
    delayMs: () => 200,
  });
  app.use(speedLimiter);

  // Compresión
  app.use(compression());

  // 🔒 Política de permisos (bloquea acceso a cámara, micrófono y geolocalización)
  app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
  });
};

// Limiter específico para login (fuera de la función)
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


