import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/server.js";

const mockSendWelcomeEmail = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule("../src/services/email.services.js", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

let token;
let cartId;
let productId;

describe("Carts API", () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "cartuser@example.com", password: "123456" });
    token = loginRes.body.accessToken;
  });

  it("Debe obtener todos los carritos", async () => {
    const res = await request(app)
      .get("/carts")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Debe agregar producto al carrito", async () => {
    const res = await request(app)
      .post(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(200);
  });

  it("Debe actualizar cantidad de un producto en el carrito", async () => {
    const res = await request(app)
      .put(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });
    expect(res.statusCode).toBe(200);
  });

  it("Debe eliminar producto del carrito", async () => {
    const res = await request(app)
      .delete(`/carts/${cartId}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("Debe vaciar el carrito", async () => {
    const res = await request(app)
      .delete(`/carts/${cartId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});




