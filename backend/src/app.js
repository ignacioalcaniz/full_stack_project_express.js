import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/jwt-strategy.js";

import { checkEnv } from "./config/check-env.js";
checkEnv();

// Routers de negocio
import ProductRouter from "./routes/products.router.js";
import TicketRouter from "./routes/ticket.router.js";
import CartRouter from "./routes/cart.router.js";
import EmailRouter from "./routes/email.router.js";
import UserRouter from "./routes/user.router.js";

// Routers de Admin
import adminRouter from "./routes/admin.router.js";
import adminExtraRouter from "./routes/admin.extra.router.js";
import adminLogsRouter from "./routes/admin.logs.router.js";
import adminSettingsRouter from "./routes/admin.settings.router.js";

// Chatbot
import ChatbotRouter from "./routes/chatbot.router.js";

// Swagger (usamos tu config centralizada)
import { swaggerSpecs, swaggerUi } from "./config/swagger.config.js";

// Middlewares
import { addLogger, requestLogger } from "./Middlewares/logger.middleware.js";
import { errorHandler } from "./Middlewares/error.handler.js";
import { applySecurity } from "./Middlewares/security.middleware.js";
import { csrfProtection } from "./Middlewares/csrf.middleware.js";
import { cacheControl } from "./Middlewares/cache.middleware.js";
import { auditMiddleware } from "./Middlewares/audit.middleware.js";
import { limiter, speedLimiter } from "./Middlewares/rate.middleware.js";
import { cspMiddleware } from "./Middlewares/csp.middleware.js";

// ==================== EXPRESS ====================
const app = express();

// ==================== PARSERS CON LÍMITE ====================
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ==================== SEGURIDAD (headers / CORS / XSS / NoSQL / HPP) ====================
applySecurity(app);
app.use(limiter);
app.use(speedLimiter);
app.use(cspMiddleware);

// ==================== LOGS / CACHE / AUDITORÍA ====================
app.use(addLogger);
app.use(requestLogger);
app.use(cacheControl);
app.use(auditMiddleware);

// ==================== SESIÓN ====================
const isDocker = process.env.DOCKER_ENV === "true";
const useMemory = process.env.NODE_ENV === "test" || process.env.USE_MEMORY_DB === "true";

const dbName = process.env.DB_NAME?.trim() || "test";
const baseMongoUrl = isDocker
  ? `${process.env.MONGO_URL || "mongodb://mongo:27017"}/${dbName}`
  : `${process.env.MONGO_URL_LOCAL || "mongodb://localhost:27017"}/${dbName}`;

let sessionConfig;

if (useMemory) {
  console.log("🧪 Modo test → sesiones en memoria (sin MongoStore)");
  sessionConfig = {
    secret: process.env.JWT_SECRET || "test_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 180000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  };
} else {
  console.log(`🔐 Usando MongoStore en → ${baseMongoUrl}`);
  sessionConfig = {
    store: MongoStore.create({
      mongoUrl: baseMongoUrl,
      collectionName: "sessions",
      ttl: 180,
    }),
    secret: process.env.JWT_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 180000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  };
}

app.use(session(sessionConfig));

// ==================== PASSPORT ====================
app.use(passport.initialize());
app.use(passport.session());

// ==================== CSRF (solo en producción) ====================
if (process.env.NODE_ENV === "production") {
  app.use(csrfProtection);
}

// ==================== SWAGGER ====================
if (process.env.NODE_ENV !== "production") {
  // Tu config centralizada en /config/swagger.config.js
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} else {
  app.get("/api/docs", (_req, res) =>
    res.status(403).json({ error: "Docs disabled in production" })
  );
}

// ==================== RUTAS ====================
app.get("/", (_req, res) =>
  res.status(200).json({ message: "API funcionando correctamente 🚀" })
);

// Público / negocio
app.use("/products", ProductRouter);
app.use("/users", UserRouter);
app.use("/carts", CartRouter);
app.use("/ticket", TicketRouter);
app.use("/email", EmailRouter);

// Administración (panel)
app.use("/admin", adminRouter);
app.use("/admin/extra", adminExtraRouter);
app.use("/admin/logs", adminLogsRouter);
app.use("/admin/settings", adminSettingsRouter);

// Chatbot
app.use("/chatbot", ChatbotRouter);

// ==================== HEALTH CHECK ====================
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ==================== HANDLER DE ERRORES ====================
app.use(errorHandler);

export default app;

















