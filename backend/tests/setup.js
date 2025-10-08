// backend/tests/setup.js
import { initMongoDb, closeMongoDb } from "../src/db/db.conection.js";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.USE_MEMORY_DB = "true";
  await initMongoDb();
});

afterAll(async () => {
  await closeMongoDb();
});






