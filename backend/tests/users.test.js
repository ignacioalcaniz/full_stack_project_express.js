import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/server.js";

const mockSendWelcomeEmail = jest.fn().mockResolvedValue(true);

// Mock del servicio de emails
jest.unstable_mockModule("../src/services/email.services.js", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

let testUser = {
  email: "testuser@example.com",
  password: "123456",
  first_name: "Test",
  last_name: "User",
};

let token;

describe("Users API", () => {
  it("Debe registrar un usuario", async () => {
    const { sendWelcomeEmail } = await import("../src/services/email.services.js");

    const res = await request(app).post("/users/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(sendWelcomeEmail).toHaveBeenCalled();
  });

  it("Debe loguear al usuario", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    token = res.body.accessToken;
  });

  it("Debe obtener el perfil autenticado", async () => {
    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", testUser.email);
  });

  it("Debe refrescar el token", async () => {
    const res = await request(app)
      .post("/users/refresh")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("Debe hacer logout y limpiar cookie", async () => {
    const res = await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout exitoso");
  });
});






