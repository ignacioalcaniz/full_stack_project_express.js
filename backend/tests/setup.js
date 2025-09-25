// tests/setup.js
import mongoose from "mongoose";
import { seedTestData } from "../scripts/seedTestData.js";

beforeAll(async () => {
  await seedTestData();
});

afterAll(async () => {
  await mongoose.connection.close();
});
