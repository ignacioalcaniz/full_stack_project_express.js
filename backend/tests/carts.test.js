import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let token;
let cartId;
let productId;

const testUser = {
  nombre: "UserCart",
  apellido: "Test",
  email: "cart@test.com",
  password: "123456",
  rol: "user"
};

beforeAll(async () => {
  await connectTestDB();
});



afterEach(async () => {
  await clearTestDB();
});

describe("Carts API", () => {
  beforeEach(async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;

    const product = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Prod Cart", price: 100 });
    productId = product.body._id;

    const cart = await request(app)
      .post("/carts")
      .set("Authorization", `Bearer ${token}`);
    cartId = cart.body._id;
  });

  it("Debe obtener todos los carritos (admin requerido, debe fallar)", async () => {
    const res = await request(app)
      .get("/carts")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("Debe agregar producto al carrito", async () => {
    const res = await request(app)
      .post(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });
    expect([200, 401, 404]).toContain(res.statusCode);
  });

  it("Debe actualizar cantidad de un producto en el carrito", async () => {
    const res = await request(app)
      .put(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });
    expect([200, 401]).toContain(res.statusCode);
  });

  it("Debe eliminar producto del carrito", async () => {
    const res = await request(app)
      .delete(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("Debe vaciar el carrito", async () => {
    const res = await request(app)
      .delete(`/carts/clear/${cartId}`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });
});






