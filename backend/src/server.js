// src/server.js
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app.js";
import { initMongoDb } from "./db/db.conection.js";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const PORT = process.env.PORT || 8080;

// 🧩 Inicializamos Mongo ANTES de levantar el servidor
const startServer = async () => {
  try {
    console.log("📡 Iniciando conexión con MongoDB...");
    await initMongoDb();
    console.log("✅ Base de datos conectada correctamente.");

    const httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
    });

    const io = new Server(httpServer);
    io.on("connection", (socket) => {
      console.log(`🟢 Cliente conectado: ${socket.id}`);
      socket.on("disconnect", () => console.log(`🔴 Cliente desconectado: ${socket.id}`));
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Solo iniciamos si no estamos en test
if (process.env.NODE_ENV !== "test") {
  startServer();
}















