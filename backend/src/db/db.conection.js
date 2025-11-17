// src/db/db.conection.js
import mongoose from "mongoose";

let memoryServer = null;
let MongoMemoryServer = null;

const joinBaseAndDb = (base, dbName) => {
  if (!base) return base;

  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalized}/${dbName}`;
};

export const initMongoDb = async () => {
  try {
    const isTest =
      process.env.NODE_ENV === "test" ||
      process.env.USE_MEMORY_DB === "true";

    const isDocker = process.env.DOCKER_ENV === "true";

    const dbName =
      (process.env.DB_NAME || "fullstackdb").trim() || "fullstackdb";

    let mongoUrl;

    // ============================================================
    // 🧠 MODO TEST / CI ─ Mongo en Memoria (import dinámico)
    // ============================================================
    if (isTest) {
      console.log("🧠 Iniciando MongoDB en memoria (modo test/CI/CD)...");

      try {
        if (!MongoMemoryServer) {
          const mod = await import("mongodb-memory-server");
          MongoMemoryServer = mod.MongoMemoryServer;
        }
      } catch (err) {
        console.error("❌ mongodb-memory-server NO está instalado.");
        console.error("Instalalo con:");
        console.error("npm install --save-dev mongodb-memory-server");
        throw err;
      }

      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }

      mongoUrl = memoryServer.getUri();
    }

    // ============================================================
    // 🐳 MODO DOCKER
    // ============================================================
    else if (isDocker) {
      console.log("🐳 Ejecutando en Docker — usando contenedor Mongo");
      const base = process.env.MONGO_URL || "mongodb://mongo:27017";
      mongoUrl = joinBaseAndDb(base, dbName);
    }

    // ============================================================
    // 💻 MODO LOCAL
    // ============================================================
    else {
      console.log("💻 Ejecutando en modo local — usando Mongo local");
      const baseLocal =
        process.env.MONGO_URL_LOCAL || "mongodb://127.0.0.1:27017";
      mongoUrl = joinBaseAndDb(baseLocal, dbName);
    }

    console.log(`📡 Intentando conectar a → ${mongoUrl}`);

    // ============================================================
    // 🔁 Reutilizar conexión existente
    // ============================================================
    const currentReady = mongoose.connection.readyState;
    const currentDb =
      mongoose.connection?.db?.client?.s?.url || null;

    if (currentReady === 1) {
      if (isTest && memoryServer) {
        console.log(
          "🔁 Reutilizando la conexión de MongoMemoryServer ya activa"
        );
        return;
      }

      try {
        if (
          currentDb &&
          mongoUrl &&
          currentDb.includes(mongoUrl.replace(/\/.*$/, ""))
        ) {
          console.log(
            "🔁 Reutilizando conexión mongoose existente (misma URI)"
          );
          return;
        }
      } catch (err) {
        /* ignorar */
      }

      console.log("🔌 Cerrando conexión mongoose previa para reconectar...");
      await mongoose.connection.close(true);
    }

    // ============================================================
    // 🔌 Conectar
    // ============================================================
    if (isTest) {
      await mongoose.connect(mongoUrl, { dbName });
    } else {
      await mongoose.connect(mongoUrl);
    }

    const openedDbName =
      mongoose.connection?.db?.databaseName || "(unknown)";

    console.log(
      `✅ Conectado a MongoDB correctamente → base de datos: ${openedDbName}`
    );
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
    console.warn(
      "⚠️ Error al cerrar la conexión Mongo:",
      error.message
    );
  }
};














