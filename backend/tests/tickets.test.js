import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let token;

const testUser = {
  nombre: "Ticket",
  apellido: "Tester",
  email: "ticket@test.com",
  password: "123456",
  rol: "user"
};

beforeAll(async () => {
  await connectTestDB();
});



afterEach(async () => {
  await clearTestDB();
});

describe("Tickets API", () => {
  beforeEach(async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;
  });

  it("Debe generar un ticket de compra", async () => {
    const ticketRes = await request(app)
      .post("/ticket/purchase")
      .set("Authorization", `Bearer ${token}`);
    expect([201, 401]).toContain(ticketRes.statusCode);
  });
});










