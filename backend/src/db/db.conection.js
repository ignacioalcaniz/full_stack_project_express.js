import mongoose from "mongoose";

let memoryServer = null;
let MongoMemoryServer = null;

const joinBaseAndDb = (base, dbName) => {
  if (!base) return base;
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;

  // si ya parece traer query params o db, no tocamos de más
  if (normalized.includes("mongodb+srv://")) return normalized;
  return `${normalized}/${dbName}`;
};

const maskMongoUri = (uri = "") => {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@");
};

export const initMongoDb = async () => {
  try {
    const isTest =
      process.env.NODE_ENV === "test" ||
      process.env.USE_MEMORY_DB === "true";

    const isDocker = process.env.DOCKER_ENV === "true";
    const isProduction = process.env.NODE_ENV === "production";

    const dbName = (
      (isProduction
        ? process.env.PROD_DB_NAME
        : process.env.DB_NAME) || "fullstackdb"
    ).trim();

    const mongoUri = process.env.MONGO_URI?.trim();
    let mongoUrl;

    console.log("   🔧 Configuración MongoDB:");
    console.log(`   • ENV: ${process.env.NODE_ENV}`);
    console.log(`   • DB_NAME: ${dbName}`);

    // 🧠 TEST / MEMORY DB
    if (isTest) {
      console.log("   → Modo TEST (MongoMemoryServer)");
      if (!MongoMemoryServer) {
        const mod = await import("mongodb-memory-server");
        MongoMemoryServer = mod.MongoMemoryServer;
      }
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      mongoUrl = memoryServer.getUri();
    }

    // ☁️ Producción / AWS / Atlas
    else if (mongoUri) {
      console.log("   → Modo ATLAS / REMOTO");
      mongoUrl = mongoUri;
    }

    // 🐳 Docker
    else if (isDocker) {
      console.log("   → Modo DOCKER");
      const base = process.env.MONGO_URL || "mongodb://mongo:27017";
      mongoUrl = joinBaseAndDb(base, dbName);
    }

    // 💻 Local
    else {
      console.log("   → Modo LOCAL");
      const base = process.env.MONGO_URL_LOCAL || "mongodb://127.0.0.1:27017";
      mongoUrl = joinBaseAndDb(base, dbName);
    }

    console.log(
      `   → URL: ${mongoUri ? maskMongoUri(mongoUrl) : mongoUrl}`
    );

    // Si ya está conectado
    if (mongoose.connection.readyState === 1) {
      console.log("   → Conexión existente reutilizada.\n");
      return mongoose.connection;
    }

    // Conectar
    await mongoose.connect(
      mongoUrl,
      isTest || mongoUri ? { dbName } : {}
    );

    console.log(`   → BD conectada: ${mongoose.connection?.db?.databaseName}\n`);
    return mongoose.connection;
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
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
      console.log("🧹 MongoMemoryServer detenido.");
    }
  } catch (error) {
    console.warn("⚠️ Error al cerrar MongoDB:", error.message);
  }
};
















