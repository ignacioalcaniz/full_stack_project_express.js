// backend/src/Middlewares/security.middleware.js
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { xss } from "../utils/xss.util.js";

function parseOrigins(envValue) {
  if (!envValue) return [];
  return envValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedDevLocal(origin) {
  try {
    const u = new URL(origin);
    const host = u.hostname;

    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
  } catch {
    return false;
  }
}

export function applySecurity(app) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  const isProd = process.env.NODE_ENV === "production";

  const envAllowed = parseOrigins(process.env.CORS_ORIGINS);
  const allowedSet = new Set(envAllowed);

  const frontendUrl = (process.env.FRONTEND_URL || "").trim();
  if (frontendUrl) {
    allowedSet.add(frontendUrl);
  }

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);

        if (allowedSet.has(origin)) return cb(null, true);

        if (!isProd && isAllowedDevLocal(origin)) return cb(null, true);

        console.log("❌ CORS bloqueado:", origin);
        return cb(new Error("No permitido por CORS"));
      },
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
        "X-Requested-With",
        "x-captcha-token",
      ],
      exposedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      maxAge: 600,
    })
  );

  app.options("*", cors());

  app.use(
    helmet({
      hsts: isProd
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: "no-referrer" },
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      frameguard: { action: "deny" },
      noSniff: true,
    })
  );

  const connectSrc = [
    "'self'",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://api.thelibrarystore.it.com",
    "wss://api.thelibrarystore.it.com",
  ];

  if (!isProd) {
    connectSrc.push("http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*");
  } else {
    for (const origin of allowedSet) {
      connectSrc.push(origin);
    }
  }

  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "base-uri": ["'none'"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": connectSrc,
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests" },
    })
  );

  app.use((req, res, next) => {
    const len = Number(req.headers["content-length"] || 0);
    if (len > 1_000_000) {
      return res.status(413).json({ error: "Payload too large" });
    }
    next();
  });

  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(compression());
}





