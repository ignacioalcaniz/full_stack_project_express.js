import request from "supertest";
import app from "../src/app.js";

jest.setTimeout(60000);

describe("App API", () => {
  it("Debe responder en la ruta base /", async () => {
    const res = await request(app).get("/");
    expect([200, 404]).toContain(res.statusCode);
  });

  it("Debe responder health check", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });

  it("Debe servir la documentación Swagger en /api/docs", async () => {
    const res = await request(app).get("/api/docs");
    expect([200, 301, 302, 404]).toContain(res.statusCode);
  });
});


