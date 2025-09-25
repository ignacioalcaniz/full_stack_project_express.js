import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/server.js";

const mockSendWelcomeEmail = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule("../src/services/email.services.js", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

let token;
let productId;

describe("Products API", () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "admin@example.com", password: "admin123" });
    token = loginRes.body.accessToken;
  });

  it("Debe crear un producto", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Producto Test", price: 50 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    productId = res.body._id;
  });

  it("Debe obtener todos los productos", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Debe obtener producto por ID", async () => {
    const res = await request(app).get(`/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", productId);
  });

  it("Debe actualizar un producto", async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 80 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("price", 80);
  });

  it("Debe eliminar un producto", async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", productId);
  });
});





