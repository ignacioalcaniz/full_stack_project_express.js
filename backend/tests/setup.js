// backend/tests/setup.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;
const localUri = "mongodb://127.0.0.1:27017/testdb";

/**
 * 🔹 Conectar antes de todos los tests
 * Si USE_MEMORY_DB=true → usa Mongo en memoria (ideal para CI/CD)
 * Si no → usa la base local (modo desarrollo normal)
 */
export const connectTestDB = async () => {
  try {
    if (process.env.USE_MEMORY_DB === "true") {
      console.log("🧠 Iniciando MongoDB en memoria (modo CI/CD)...");
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    } else {
      console.log("🔗 Conectando a Mongo local...");
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    }
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos de test:", err);
    throw err;
  }
};

/**
 * 🔹 Limpiar colecciones entre tests
 */
export const clearTestDB = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

/**
 * 🔹 Cerrar al final
 */
export const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
    if (memoryServer) {
      await memoryServer.stop();
      console.log("🧹 MongoMemoryServer detenido correctamente");
    }
  } catch (err) {
    console.warn("⚠️ Error al cerrar la base de datos de test:", err.message);
  }
};





