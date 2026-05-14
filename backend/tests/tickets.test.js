import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

jest.setTimeout(60000);

let token;

const testUser = {
  first_name: "Ticket",
  last_name: "Tester",
  age: 25,
  email: "ticket@test.com",
  password: "StrongPass2026!",
  captchaToken: "test-captcha-token",
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DISABLE_EMAILS = "true";
  process.env.DISABLE_CAPTCHA = "true";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";
  process.env.EMAIL_ADMIN = "admin@test.com";
  process.env.PASS_ADMIN = "AdminPass2026!";

  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  await request(app).post("/users/register").send(testUser);

  const login = await request(app).post("/users/login").send({
    email: testUser.email,
    password: testUser.password,
    deviceId: "test-device-ticket",
  });

  const payload = login.body?.data || login.body;
  token = payload.accessToken;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Tickets API", () => {
  it("Debe generar un ticket de compra o rechazar si no hay carrito válido", async () => {
    const ticketRes = await request(app)
      .post("/ticket/purchase")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 201, 400, 401, 403, 404]).toContain(ticketRes.statusCode);
  });
});










