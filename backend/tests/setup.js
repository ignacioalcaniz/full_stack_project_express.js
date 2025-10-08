// backend/tests/setup.js
import mongoose from "mongoose";
import { initMongoDb, closeMongoDb } from "../src/db/db.conection.js";

/**
 * ✅ Conecta la base de datos en memoria para Jest (CI/CD y local)
 */
export const connectTestDB = async () => {
  process.env.NODE_ENV = "test";
  process.env.USE_MEMORY_DB = "true";
  await initMongoDb();
};

/**
 * 🧹 Limpia todas las colecciones entre tests
 */
export const clearTestDB = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

/**
 * 🔻 Cierra la base de datos y detiene el servidor en memoria
 */
export const closeTestDB = async () => {
  await closeMongoDb();
};

// Hooks automáticos para Jest
beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB(); // limpia entre tests
});

afterAll(async () => {
  await closeTestDB();
});







