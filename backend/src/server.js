// src/server.js
import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
import events from "events";
events.EventEmitter.defaultMaxListeners = 20;
import { Server } from "socket.io";
import app from "./app.js";
import { initMongoDb } from "./db/db.conection.js";
import { createHttpsServer } from "./Middlewares/https.middleware.js";
import { checkEnv } from "./config/check-env.js";   // ⬅️ AGREGADO

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // ⬅️ EJECUTAMOS LAS VALIDACIONES DE ENTORNO ANTES DE TODO
    checkEnv();

    console.log("📡 Iniciando conexión con MongoDB...");
    await initMongoDb();
    console.log("✅ Base de datos conectada correctamente.");

    let httpServer;

    if (process.env.HTTPS === "true") {
      const httpsServer = createHttpsServer(app);
      httpsServer.listen(PORT, () =>
        console.log(`🔒 Servidor HTTPS escuchando en https://localhost:${PORT}`)
      );
      httpServer = httpsServer;
    } else {
      httpServer = app.listen(PORT, "0.0.0.0", () =>
        console.log(`🚀 Servidor HTTP escuchando en http://localhost:${PORT}`)
      );
    }

    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    io.use((socket, next) => {
      try {
        return next();
      } catch (e) {
        return next(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`🟢 Cliente conectado: ${socket.id}`);
      socket.on("disconnect", () =>
        console.log(`🔴 Cliente desconectado: ${socket.id}`)
      );
    });

    httpServer.headersTimeout = 65_000;
    httpServer.requestTimeout = 30_000;
    httpServer.keepAliveTimeout = 10_000;
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}



















