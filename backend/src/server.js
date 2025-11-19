// src/server.js
import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

import events from "events";
events.EventEmitter.defaultMaxListeners = 20;

import { Server } from "socket.io";
import app from "./app.js";
import { initMongoDb } from "./db/db.conection.js";
import { createHttpsServer } from "./Middlewares/https.middleware.js";
import { checkEnv } from "./config/check-env.js";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // 💡 Banner inicial profesional
    console.log("\n=========================================");
    console.log(`🚀 FULLSTACK BACKEND — ENV: ${process.env.NODE_ENV}`);
    console.log("=========================================\n");

    // ✔️ Validación de entorno una sola vez
    checkEnv();

    // ✔️ Conexión Mongo
    console.log("📡 Conectando a MongoDB...\n");
    await initMongoDb();
    console.log("☑️  Base de datos lista.\n");

    let httpServer;

    // HTTPS o HTTP
    if (process.env.HTTPS === "true") {
      const httpsServer = createHttpsServer(app);
      httpsServer.listen(PORT, () =>
        console.log(`🔒 Servidor HTTPS → https://localhost:${PORT}`)
      );
      httpServer = httpsServer;
    } else {
      httpServer = app.listen(PORT, "0.0.0.0", () => {
        console.log("🌐 Servidor listo:");
        console.log(`   → http://localhost:${PORT}`);
        console.log("\n=========================================\n");
      });
    }

    // Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
      console.log(`🟢 Cliente conectado: ${socket.id}`);
    });

    // Timeouts pro
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





















