// backend/tests/setup.js
import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/testdb";

// 🔹 Conectar antes de todos los tests
export const connectTestDB = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
};

// 🔹 Limpiar colecciones entre tests
export const clearTestDB = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

// 🔹 Cerrar al final
export const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
    } catch (err) {
      console.warn("⚠️ No se pudo dropear la DB de test:", err.message);
    }
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.warn("⚠️ No se pudo desconectar mongoose:", err.message);
    }
  }
};




