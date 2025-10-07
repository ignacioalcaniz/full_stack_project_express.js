import express, { urlencoded } from "express";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/jwt-strategy.js";
import Productrouter from "./routes/products.router.js";
import TicketRouter from "./routes/ticket.router.js";
import CartRouter from "./routes/cart.router.js";
import emailRouter from "./routes/email.router.js";
import UserRouter from "./routes/user.router.js";
import { swaggerSpecs, swaggerUi } from "./config/swagger.config.js";
import { addLogger, requestLogger } from "./Middlewares/logger.middleware.js";
import { errorHandler } from "./Middlewares/error.handler.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middlewares
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(addLogger);
app.use(requestLogger);

// 🧠 Sessions
let sessionConfig;

if (process.env.NODE_ENV === "test" || process.env.USE_MEMORY_DB === "true") {
  console.log("🧪 Modo test detectado → sin MongoStore (memoria local)");
  sessionConfig = {
    secret: process.env.JWT_SECRET || "test_secret",
    resave: false,
    saveUninitialized: false,
  };
} else {
  sessionConfig = {
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 180,
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 180000 },
  };
}

app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Ruta base
app.get("/", (req, res) => {
  res.status(200).json({ message: "API funcionando" });
});

// Rutas
app.use("/products", Productrouter);
app.use("/users", UserRouter);
app.use("/carts", CartRouter);
app.use("/ticket", TicketRouter);
app.use("/email", emailRouter);

// Error handler
app.use(errorHandler);

export default app;



