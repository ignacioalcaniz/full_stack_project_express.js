// backend/tests/setup.js
import { initMongoDb, closeMongoDb } from "../src/db/db.conection.js";

export const connectTestDB = async () => {
  process.env.NODE_ENV = "test";
  process.env.USE_MEMORY_DB = "true";
  await initMongoDb();
};

export const closeTestDB = async () => {
  await closeMongoDb();
};

// Hooks automáticos para Jest
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});






