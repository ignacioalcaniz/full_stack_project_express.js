import mongoose from "mongoose";

let memoryServer = null;
let MongoMemoryServer = null;

// ===============================
// 🔧 Helper para unir base + DB
// ===============================
const joinBaseAndDb = (base, dbName) => {
  if (!base) return base;
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalized}/${dbName}`;
};

// ===============================
// 🚀 Inicialización
// ===============================
export const initMongoDb = async () => {
  try {
    // ------------------------------
    // 🔍 Detectar modo
    // ------------------------------
    const isTest =
      process.env.NODE_ENV === "test" ||
      process.env.USE_MEMORY_DB === "true";

    const isDocker = process.env.DOCKER_ENV === "true";

    const dbName = (process.env.DB_NAME || "fullstackdb").trim();

    let mongoUrl;

    console.log("===============================================");
    console.log("  🧩 Configuración de conexión MongoDB");
    console.log("===============================================");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("USE_MEMORY_DB:", process.env.USE_MEMORY_DB);
    console.log("DOCKER_ENV:", process.env.DOCKER_ENV);
    console.log("MONGO_URL_LOCAL:", process.env.MONGO_URL_LOCAL);
    console.log("MONGO_URL:", process.env.MONGO_URL);
    console.log("DB_NAME:", dbName);
    console.log("-----------------------------------------------");

    // ------------------------------
    // 🧠 MODO TEST / MEMORIA
    // ------------------------------
    if (isTest) {
      console.log("🧠 Modo TEST — inicializando MongoMemoryServer...");

      if (!MongoMemoryServer) {
        const mod = await import("mongodb-memory-server");
        MongoMemoryServer = mod.MongoMemoryServer;
      }

      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }

      mongoUrl = memoryServer.getUri();
    }

    // ------------------------------
    // 🐳 MODO DOCKER
    // ------------------------------
    else if (isDocker) {
      console.log("🐳 Modo DOCKER — conectando a contenedor mongo...");
      const base = process.env.MONGO_URL || "mongodb://mongo:27017";
      mongoUrl = joinBaseAndDb(base, dbName);
    }

    // ------------------------------
    // 💻 MODO LOCAL
    // ------------------------------
    else {
      console.log("💻 Modo LOCAL — conectando a Mongo local...");
      const base = process.env.MONGO_URL_LOCAL || "mongodb://127.0.0.1:27017";
      mongoUrl = joinBaseAndDb(base, dbName);
    }

    console.log(`📡 Conectando a → ${mongoUrl}`);

    // ------------------------------
    // 🔁 Reutilizar conexión si existe
    // ------------------------------
    if (mongoose.connection.readyState === 1) {
      console.log("🔁 Reutilizando conexión existente de Mongoose.");
      return;
    }

    // ------------------------------
    // 🔌 Conectar
    // ------------------------------
    await mongoose.connect(mongoUrl, isTest ? { dbName } : {});

    console.log(
      `✅ MongoDB conectado → BD: ${mongoose.connection?.db?.databaseName}`
    );
    console.log("===============================================");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
};

// ===============================
// 🧹 Cierre limpio
// ===============================
export const closeMongoDb = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(true);
    }

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
      console.log("🧹 MongoMemoryServer detenido.");
    }
  } catch (error) {
    console.warn("⚠️ Error al cerrar MongoDB:", error.message);
  }
};














