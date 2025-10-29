// src/app.js
import express, { urlencoded } from "express";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";

import "./config/jwt-strategy.js";
import ProductRouter from "./routes/products.router.js";
import TicketRouter from "./routes/ticket.router.js";
import CartRouter from "./routes/cart.router.js";
import EmailRouter from "./routes/email.router.js";
import UserRouter from "./routes/user.router.js";
import { swaggerSpecs, swaggerUi } from "./config/swagger.config.js";
import { addLogger, requestLogger } from "./Middlewares/logger.middleware.js";
import { errorHandler } from "./Middlewares/error.handler.js";
import { applySecurity } from "./Middlewares/security.middleware.js";
import { csrfProtection } from "./Middlewares/csrf.middleware.js";
import { cacheControl } from "./Middlewares/cache.middleware.js";
import { auditMiddleware } from "./Middlewares/audit.middleware.js";
import { limiter, speedLimiter } from "./Middlewares/rate.middleware.js";
import { cspMiddleware } from "./Middlewares/csp.middleware.js";

dotenv.config();

const app = express();

// ==================== SWAGGER ====================
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ==================== SEGURIDAD ====================
applySecurity(app);
app.use(limiter);
app.use(speedLimiter);
app.use(cspMiddleware);


// ==================== MIDDLEWARES ====================
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(addLogger);
app.use(requestLogger);
app.use(cacheControl);
app.use(auditMiddleware);

// ==================== CONFIG DE SESIÓN ====================
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

// ==================== RUTAS ====================
app.get("/", (req, res) =>
  res.status(200).json({ message: "API funcionando correctamente 🚀" })
);
app.use("/products", ProductRouter);
app.use("/users", UserRouter);
app.use("/carts", CartRouter);
app.use("/ticket", TicketRouter);
app.use("/email", EmailRouter);

// ==================== HANDLER DE ERRORES ====================
app.use(errorHandler);

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});


export default app;














