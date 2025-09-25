import request from "supertest";
import app from "../src/app";


describe("App", () => {
  it("Debe responder en la ruta base con 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "API funcionando");
  });
});


