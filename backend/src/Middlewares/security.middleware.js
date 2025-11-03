// backend/src/Middlewares/security.middleware.js
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "../utils/xss.util.js"; // Sanitizador de strings
import compression from "compression";
import rateLimit from "express-rate-limit";

export function applySecurity(app) {
  // Deshabilitar header de tecnología
  app.disable("x-powered-by");

  // Trust proxy para cookies secure / HTTPS detrás de proxy
  app.set("trust proxy", 1);

  // CORS estricto (ajusta FRONTEND_URL en .env)
  const allowOrigin = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
  app.use(
    cors({
      origin: allowOrigin,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      maxAge: 600, // cache preflight 10min
    })
  );

  // Helmet: headers seguros + HSTS si producción/HTTPS
  const isProd = process.env.NODE_ENV === "production";
  app.use(
    helmet({
      hsts: isProd
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: "no-referrer" },
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      crossOriginEmbedderPolicy: { policy: "require-corp" },
      frameguard: { action: "deny" },
      noSniff: true,
    })
  );

  // CSP razonable para API/Swagger (ajustar si servís frontend estático)
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "base-uri": ["'none'"],
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", allowOrigin],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    })
  );

  // Limitadores globales de requests para abuso genérico
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests" },
    })
  );

  // Body parsers con límites para evitar DoS por payloads grandes
  app.use((req, res, next) => {
    // NOTA: express.json/urlencoded ya se cargan en app.js, pero aquí
    // nos aseguramos de rechazar >1MB mediante header Content-Length.
    const len = Number(req.headers["content-length"] || 0);
    if (len > 1_000_000) return res.status(413).json({ error: "Payload too large" });
    next();
  });

  // Anti HTTP Parameter Pollution
  app.use(hpp());

  // Anti NoSQL injection (quita operadores $ y . en paths)
  app.use(mongoSanitize());

  // Anti-XSS: sanitiza strings en body/query/params
  app.use(xss());

  // Compresión (mejora rendimiento; no es seguridad, pero ayuda contra amplification)
  app.use(compression());
}


