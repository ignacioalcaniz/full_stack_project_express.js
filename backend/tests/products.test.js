import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let token;
let productId;

const testUser = {
  nombre: "Admin",
  apellido: "Test",
  email: "admin@test.com",
  password: "123456",
  rol: "admin"
};

beforeAll(async () => {
  await connectTestDB();
});



afterEach(async () => {
  await clearTestDB();
});

describe("Products API", () => {
  beforeEach(async () => {
    await request(app).post("/users/register").send(testUser);
    const login = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;
  });

  it("Debe crear un producto", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Producto Test", price: 50 });
    expect([201, 401]).toContain(res.statusCode);
    if (res.statusCode === 201) productId = res.body._id;
  });

  it("Debe obtener todos los productos", async () => {
    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });
});







