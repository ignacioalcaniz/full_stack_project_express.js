import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/jwt-strategy.js";

// ✅ Settings + guards + rate
import { attachSettings } from "./Middlewares/settings.attach.js";
import { maintenanceGuard } from "./Middlewares/maintenance.middleware.js";
import { dynamicLimiter, speedLimiter } from "./Middlewares/rate.middleware.js";

// Routers negocio
import ProductRouter from "./routes/products.router.js";
import TicketRouter from "./routes/ticket.router.js";
import CartRouter from "./routes/cart.router.js";
import EmailRouter from "./routes/email.router.js";
import UserRouter from "./routes/user.router.js";
import PaymentRouter from "./routes/payment.router.js";

// Routers Admin
import adminRouter from "./routes/admin.router.js";
import adminExtraRouter from "./routes/admin.extra.router.js";
import adminLogsRouter from "./routes/admin.logs.router.js";
import adminSettingsRouter from "./routes/admin.settings.router.js";
import adminChatbotRouter from "./routes/admin.chatbot.router.js";

// Chatbot público
import ChatbotRouter from "./routes/chatbot.router.js";

// Swagger
import { swaggerSpecs, swaggerUi } from "./config/swagger.config.js";

// Middlewares core
import { addLogger, requestLogger } from "./Middlewares/logger.middleware.js";
import { errorHandler } from "./Middlewares/error.handler.js";
import { applySecurity } from "./Middlewares/security.middleware.js";
import {
  rawCsrfProtection,
  csrfProtection,
  csrfTokenController,
  csrfErrorHandler,
} from "./Middlewares/csrf.middleware.js";
import { cacheControl } from "./Middlewares/cache.middleware.js";
import { auditMiddleware } from "./Middlewares/audit.middleware.js";
import { cspMiddleware } from "./Middlewares/csp.middleware.js";
import { adminActionLogger } from "./Middlewares/admin.action.logger.js";

const app = express();

// Parsers
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Seguridad headers/CORS/etc
applySecurity(app);
app.use(cspMiddleware);

// Logs + cache
app.use(addLogger);
app.use(requestLogger);
app.use(cacheControl);

// Settings
app.use(attachSettings);

// Maintenance guard
app.use(maintenanceGuard);

// Rate limit dinámico
app.use(dynamicLimiter);
app.use(speedLimiter);

// Auditoría
app.use(auditMiddleware);

// Sesión
const isDocker = process.env.DOCKER_ENV === "true";
const useMemory =
  process.env.NODE_ENV === "test" || process.env.USE_MEMORY_DB === "true";
const isProduction = process.env.NODE_ENV === "production";

const dbName = (
  (isProduction ? process.env.PROD_DB_NAME : process.env.DB_NAME) || "test"
).trim();

const mongoUri = process.env.MONGO_URI?.trim();

const baseMongoUrl = mongoUri
  ? mongoUri
  : isDocker
    ? `${process.env.MONGO_URL || "mongodb://mongo:27017"}/${dbName}`
    : `${process.env.MONGO_URL_LOCAL || "mongodb://localhost:27017"}/${dbName}`;

let sessionConfig;

if (useMemory) {
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

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Endpoint para emitir token CSRF
if (process.env.NODE_ENV === "production") {
  app.get("/csrf-token", rawCsrfProtection, csrfTokenController);
  app.use(csrfProtection);
}

// Swagger
if (process.env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} else {
  app.get("/api/docs", (_req, res) =>
    res.status(403).json({ error: "Docs disabled in production" })
  );
}

// Routes
app.get("/", (_req, res) =>
  res.status(200).json({ message: "API funcionando correctamente 🚀" })
);

app.use("/products", ProductRouter);
app.use("/users", UserRouter);
app.use("/carts", CartRouter);
app.use("/ticket", TicketRouter);
app.use("/email", EmailRouter);
app.use("/payments", PaymentRouter);

app.use("/admin", adminActionLogger);
app.use("/admin", adminRouter);
app.use("/admin/extra", adminExtraRouter);
app.use("/admin/logs", adminLogsRouter);
app.use("/admin/settings", adminSettingsRouter);
app.use("/admin/chatbot", adminChatbotRouter);

app.use("/chatbot", ChatbotRouter);

// Health
app.get("/health", (_req, res) =>
  res.status(200).json({ status: "ok", uptime: process.uptime() })
);

// Error handlers
app.use(csrfErrorHandler);
app.use(errorHandler);

export default app;


















