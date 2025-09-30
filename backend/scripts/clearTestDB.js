// backend/scripts/clearTestDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "tests/.env.test" });

const clearTestDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // 🔄 Limpiar todas las colecciones
    const collections = Object.keys(mongoose.connection.collections);
    for (const name of collections) {
      await mongoose.connection.collections[name].deleteMany({});
    }

    console.log("🧹 Test DB limpiada con éxito");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al limpiar la DB de test:", error);
    process.exit(1);
  }
};

clearTestDB();
