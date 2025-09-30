import request from "supertest";
import app from "../src/app.js";

describe("App API", () => {
  it("Debe responder en la ruta base /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("Debe servir la documentación Swagger en /api/docs", async () => {
    const res = await request(app).get("/api/docs");
    expect([200, 301]).toContain(res.statusCode); // acepta redirect
  });
});


