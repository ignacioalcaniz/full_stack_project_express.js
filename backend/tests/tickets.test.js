import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/server.js";

const mockSendWelcomeEmail = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule("../src/services/email.services.js", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

let token;
let productId;

describe("Tickets API", () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "ticketer@example.com", password: "123456" });
    token = loginRes.body.accessToken;
  });

  it("Debe agregar producto al carrito", async () => {
    const res = await request(app)
      .post(`/carts/${token}/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(200);
  });

  it("Debe generar un ticket de compra", async () => {
    const ticketRes = await request(app)
      .post("/ticket/purchase")
      .set("Authorization", `Bearer ${token}`);
    expect(ticketRes.statusCode).toBe(201);
    expect(ticketRes.body).toHaveProperty("code");
    expect(ticketRes.body).toHaveProperty("amount");
  });
});








