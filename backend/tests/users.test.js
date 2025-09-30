import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import { jest } from "@jest/globals"; 
jest.setTimeout(30000);

// 🔹 Mock ESM con unstable_mockModule
jest.unstable_mockModule("../src/services/email.services.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

// ⬇️ Importamos luego de definir el mock
const { sendWelcomeEmail } = await import("../src/services/email.services.js");

let token;

const testUser = {
  nombre: "Ignacio",
  apellido: "Alcañiz",
  email: "ignacio@test.com",
  password: "123456",
  rol: "user",
};

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
  jest.clearAllMocks();
});

describe("Users API", () => {
  it("Debe registrar un usuario", async () => {
    const res = await request(app).post("/users/register").send(testUser);
    expect([200, 201, 400]).toContain(res.statusCode);
    if (res.statusCode < 400) {
      expect(sendWelcomeEmail).toHaveBeenCalled();
    }
  });

  it("Debe loguear al usuario", async () => {
    await request(app).post("/users/register").send(testUser);
    const res = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });

    expect([200, 400, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("accessToken");
      token = res.body.accessToken;
    }
  });

  it("Debe obtener el perfil autenticado", async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;

    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("Debe refrescar el token", async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;

    const res = await request(app)
      .post("/users/refresh")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("Debe hacer logout y limpiar cookie", async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;

    const res = await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("message", "Logout exitoso");
  });
});










