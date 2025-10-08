// src/db/db.conection.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const initMongoDb = async () => {
  try {
    // 🧠 Si estamos en test o CI/CD → usar MongoMemoryServer
    if (process.env.NODE_ENV === "test" || process.env.USE_MEMORY_DB === "true") {
      console.log("🧠 Iniciando MongoDB en memoria (modo test/CI/CD)...");
      if (!memoryServer) memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
    } else {
      // 🧩 Si estamos en entorno local o producción → usar conexión real
      const mongoUrl =
        process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fullstack_db";
      console.log(`🔗 Conectando a MongoDB en ${mongoUrl}...`);
      await mongoose.connect(mongoUrl);
    }

    console.log("✅ Conectado a MongoDB correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    throw error;
  }
};

export const closeMongoDb = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      console.log("🧹 MongoMemoryServer detenido correctamente");
    }
  } catch (error) {
    console.warn("⚠️ Error al cerrar la conexión Mongo:", error.message);
  }
};

