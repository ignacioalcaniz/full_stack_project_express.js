import request from "supertest";
import app from "../src/app.js";
import {
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "./setup.js";

jest.setTimeout(60000);

let token;

const adminUser = {
  first_name: "Admin",
  last_name: "Test",
  age: 30,
  email: "admin@test.com",
  password: "LibraryAdminSecure2026!RiverSky",
  captchaToken: "test-captcha",
};

const productPayload = {
  nombre: "Producto Test",
  descripcion: "Producto de prueba enterprise para el panel admin",
  precio: 50,
  stock: 10,
  categoria: "test",
  imagen: "https://example.com/producto-test.jpg",
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DISABLE_EMAILS = "true";
  process.env.DISABLE_CAPTCHA = "true";
  process.env.DISABLE_STEP_UP_AUTH = "true";
  process.env.DISABLE_RATE_LIMIT = "true";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

  process.env.EMAIL_ADMIN = adminUser.email;
  process.env.PASS_ADMIN = adminUser.password;

  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Products API", () => {
  beforeEach(async () => {
    const register = await request(app)
      .post("/users/register")
      .send(adminUser);

    expect([200, 201]).toContain(register.statusCode);

    const login = await request(app)
      .post("/users/login")
      .send({
        email: adminUser.email,
        password: adminUser.password,
        deviceId: "test-device-products",
      });

    expect(login.statusCode).toBe(200);

    const payload = login.body?.data || login.body;
    token = payload.accessToken;

    expect(token).toBeTruthy();
  });

  it("Debe crear un producto desde el panel admin", async () => {
    const res = await request(app)
      .post("/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productPayload);

    expect([200, 201]).toContain(res.statusCode);

    const payload = res.body?.data || res.body;
    expect(payload).toBeDefined();
  });

  it("Debe obtener todos los productos públicos", async () => {
    await request(app)
      .post("/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productPayload);

    const res = await request(app).get("/products");

    expect(res.statusCode).toBe(200);
  });
});






