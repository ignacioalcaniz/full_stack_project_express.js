// scripts/seedTestData.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Importar modelos
import { UserModel } from "../src/model/user.model.js";
import { ProductModel } from "../src/model/product.model.js";
import { CartModel } from "../src/model/cart.model.js";
import { TicketModel } from "../src/model/ticket.model.js";

dotenv.config({ path: "tests/.env.test" });

export const seedTestData = async () => {
  await mongoose.connect(process.env.MONGO_URL);

  // 🔄 Limpiar colecciones
  await UserModel.deleteMany({});
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});
  await TicketModel.deleteMany({});

  // 👤 Usuario de prueba (agregando todos los campos requeridos)
  const user = await UserModel.create({
    first_name: "Test",
    last_name: "User",
    age: 25,
    email: "testuser@mail.com",
    password: "123456", // tu pre-save de bcrypt se encarga de encriptarlo
    role: "user",
  });

  // 🛒 Carrito vacío del user
  const cart = await CartModel.create({
    user: user._id,
    products: [],
  });

  // 📦 Producto inicial
  const product = await ProductModel.create({
    title: "Producto Seed",
    description: "Producto de prueba inicial",
    price: 100,
    stock: 10,
  });

  return { user, product, cart };
};


