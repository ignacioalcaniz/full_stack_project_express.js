// backend/scripts/seedTestData.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// Models
import { UserModel } from "../src/model/user.model.js";
import { ProductModel } from "../src/model/product.model.js";
import { CartModel } from "../src/model/cart.model.js";

dotenv.config({ path: "tests/.env.test" });

export const seedTestData = async () => {
  await mongoose.connect(process.env.MONGO_URL);

  // 🔄 Limpiar colecciones
  await UserModel.deleteMany({});
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});

  // 👤 Usuario de prueba
  const user = await UserModel.create({
    email: "testuser@mail.com",
    password: "123456", // bcrypt se ejecuta si lo tenés en pre-save
    role: "user",
    first_name: "Test",
    last_name: "User",
    age: 30,
  });

  // 🛒 Carrito vacío del user
  const cart = await CartModel.create({
    user: user._id,
    products: [],
  });

  // 📦 Producto inicial con TODOS los campos requeridos
  const product = await ProductModel.create({
    nombre: "Producto Seed",
    descripcion: "Producto de prueba inicial",
    precio: 100,
    stock: 10,
    categoria: "general",
    imagen: "https://via.placeholder.com/150",
  });

  return { user, product, cart };
};


