import { setupTestDB, teardownTestDB } from "./setup.js";

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
