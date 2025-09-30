import { connectTestDB, closeTestDB } from "./setup.js";

// Conectar antes de todos los tests
beforeAll(async () => {
  await connectTestDB();
});

// Cerrar después de todos los tests
afterAll(async () => {
  await closeTestDB();
});

