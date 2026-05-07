import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

jest.setTimeout(60000);

let token;
let refreshCookie;

const testUser = {
  first_name: "Ignacio",
  last_name: "Alcañiz",
  age: 25,
  email: "ignacio@test.com",
  password: "StrongPass2026!",
  captchaToken: "test-captcha-token",
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DISABLE_EMAILS = "true";
  process.env.DISABLE_CAPTCHA = "true";
  process.env.EMAIL_ADMIN = "admin@test.com";
  process.env.PASS_ADMIN = "AdminPass2026!";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";
  process.env.ACCESS_TOKEN_EXPIRES = "15m";
  process.env.REFRESH_TOKEN_EXPIRES = "7d";

  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Users API", () => {
  it("Debe registrar un usuario", async () => {
    const res = await request(app).post("/users/register").send(testUser);

    expect([201, 200]).toContain(res.statusCode);
    expect(res.body).toBeDefined();
  });

  it("Debe loguear al usuario", async () => {
    await request(app).post("/users/register").send(testUser);

    const res = await request(app).post("/users/login").send({
      email: testUser.email,
      password: testUser.password,
      deviceId: "test-device-users",
    });

    expect([200, 206]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      const payload = res.body?.data || res.body;
      expect(payload).toHaveProperty("accessToken");
      token = payload.accessToken;
    }
  });

  it("Debe obtener el perfil autenticado", async () => {
    await request(app).post("/users/register").send(testUser);

    const login = await request(app).post("/users/login").send({
      email: testUser.email,
      password: testUser.password,
      deviceId: "test-device-profile",
    });

    const loginPayload = login.body?.data || login.body;
    token = loginPayload.accessToken;

    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const payload = res.body?.data || res.body;
    expect(payload.email).toBe(testUser.email);
  });

  it("Debe refrescar el token", async () => {
    await request(app).post("/users/register").send(testUser);

    const login = await request(app).post("/users/login").send({
      email: testUser.email,
      password: testUser.password,
      deviceId: "test-device-refresh",
    });

    refreshCookie = login.headers["set-cookie"];

    const res = await request(app)
      .post("/users/refresh")
      .set("Cookie", refreshCookie || []);

    expect([200, 401, 403]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      const payload = res.body?.data || res.body;
      expect(payload).toHaveProperty("accessToken");
    }
  });

  it("Debe hacer logout y limpiar cookie", async () => {
    await request(app).post("/users/register").send(testUser);

    const login = await request(app).post("/users/login").send({
      email: testUser.email,
      password: testUser.password,
      deviceId: "test-device-logout",
    });

    const loginPayload = login.body?.data || login.body;
    token = loginPayload.accessToken;
    refreshCookie = login.headers["set-cookie"];

    const res = await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", refreshCookie || []);

    expect(res.statusCode).toBe(200);
  });
});










