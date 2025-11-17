// src/db/db.conection.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer = null;

const joinBaseAndDb = (base, dbName) => {
  if (!base) return base;
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalized}/${dbName}`;
};

export const initMongoDb = async () => {
  try {
    // 🔥 FIX 1: En Docker JAMÁS se usa MongoMemoryServer
    if (process.env.DOCKER_ENV === "true") {
      process.env.USE_MEMORY_DB = "false";
    }

    // 🔥 FIX 2: Comparaciones estrictas, sin interpretar strings "false"
    const isTest = process.env.USE_MEMORY_DB === "true" || process.env.NODE_ENV === "test";
    const isDocker = process.env.DOCKER_ENV === "true";

    const dbName = (process.env.DB_NAME || "fullstackdb").trim() || "fullstackdb";

    let mongoUrl;

    if (isTest) {
      console.log("🧠 Iniciando MongoDB en memoria (modo test/CI/CD)...");

      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }

      mongoUrl = memoryServer.getUri();

    } else if (isDocker) {
      const base = process.env.MONGO_URL || "mongodb://mongo:27017";
      mongoUrl = joinBaseAndDb(base, dbName);

    } else {
      const baseLocal = process.env.MONGO_URL_LOCAL || "mongodb://127.0.0.1:27017";
      mongoUrl = joinBaseAndDb(baseLocal, dbName);
    }

    console.log(`📡 Intentando conectar a → ${mongoUrl}`);

    const currentReady = mongoose.connection.readyState;
    const currentDb = mongoose.connection?.db?.client?.s?.url || null;

    // Reusar conexiones si aplica
    if (currentReady === 1) {
      if (isTest && memoryServer) {
        console.log("🔁 Reutilizando conexión de MongoMemoryServer ya activa");
        return;
      }

      try {
        if (currentDb && mongoUrl && currentDb.includes(mongoUrl.replace(/\/.*$/, ""))) {
          console.log("🔁 Reutilizando conexión mongoose existente (misma URI)");
          return;
        }
      } catch (err) {}

      console.log("🔌 Cerrando conexión mongoose previa para reconectar...");
      await mongoose.connection.close(true);
    }

    // 🔥 FIX 3: conexión consistente
    if (isTest) {
      await mongoose.connect(mongoUrl, { dbName });
    } else {
      await mongoose.connect(mongoUrl);
    }

    const openedDbName = mongoose.connection?.db?.databaseName || "(unknown)";
    console.log(`✅ Conectado a MongoDB correctamente → base de datos: ${openedDbName}`);

  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message || error);
    throw error;
  }
};

export const closeMongoDb = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(true);
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
      console.log("🧹 MongoMemoryServer detenido correctamente");
    }
  } catch (error) {
    console.warn("⚠️ Error al cerrar la conexión Mongo:", error.message);
  }
};












