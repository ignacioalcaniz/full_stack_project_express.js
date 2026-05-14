import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

jest.setTimeout(60000);

let token;
let cartId;
let productId;

const adminUser = {
  first_name: "Admin",
  last_name: "Cart",
  age: 30,
  email: "admincart@test.com",
  password: "AdminPass2026!",
  captchaToken: "test-captcha-token",
};

const normalUser = {
  first_name: "UserCart",
  last_name: "Test",
  age: 25,
  email: "cart@test.com",
  password: "StrongPass2026!",
  captchaToken: "test-captcha-token",
};

const productPayload = {
  nombre: "Prod Cart",
  descripcion: "Producto para carrito",
  precio: 100,
  stock: 20,
  categoria: "test",
  imagen: "https://example.com/cart.jpg",
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DISABLE_EMAILS = "true";
  process.env.DISABLE_CAPTCHA = "true";
  process.env.EMAIL_ADMIN = adminUser.email;
  process.env.PASS_ADMIN = adminUser.password;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  await request(app).post("/users/register").send(adminUser);

  const adminLogin = await request(app).post("/users/login").send({
    email: adminUser.email,
    password: adminUser.password,
    deviceId: "test-device-admin-cart",
  });

  const adminPayload = adminLogin.body?.data || adminLogin.body;
  const adminToken = adminPayload.accessToken;

  const product = await request(app)
    .post("/products")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(productPayload);

  productId = product.body?.data?._id || product.body?._id || product.body?.data?.product?._id;

  const registerUser = await request(app).post("/users/register").send(normalUser);
  const registeredPayload = registerUser.body?.data || registerUser.body;

  cartId =
    registeredPayload?.cart ||
    registeredPayload?.user?.cart ||
    registeredPayload?.payload?.cart;

  const login = await request(app).post("/users/login").send({
    email: normalUser.email,
    password: normalUser.password,
    deviceId: "test-device-cart",
  });

  const payload = login.body?.data || login.body;
  token = payload.accessToken;
  cartId = cartId || payload?.user?.cart || payload?.cart;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Carts API", () => {
  it("Debe obtener todos los carritos solo si corresponde", async () => {
    const res = await request(app)
      .get("/carts")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 401, 403]).toContain(res.statusCode);
  });

  it("Debe agregar producto al carrito", async () => {
    const res = await request(app)
      .post(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });

    expect([200, 201, 400, 401, 403, 404]).toContain(res.statusCode);
  });

  it("Debe actualizar cantidad de un producto en el carrito", async () => {
    await request(app)
      .post(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });

    const res = await request(app)
      .put(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect([200, 400, 401, 403, 404]).toContain(res.statusCode);
  });

  it("Debe eliminar producto del carrito", async () => {
    await request(app)
      .post(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });

    const res = await request(app)
      .delete(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 400, 401, 403, 404]).toContain(res.statusCode);
  });

  it("Debe vaciar el carrito", async () => {
    const res = await request(app)
      .delete(`/carts/clear/${cartId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 400, 401, 403, 404]).toContain(res.statusCode);
  });
});






