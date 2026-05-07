import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const LOCAL_DB_NAME = (process.env.DB_NAME || "test").trim();
const PROD_DB_NAME = (process.env.PROD_DB_NAME || "fullstackdb").trim();

const LOCAL_URI =
  process.env.MONGO_URL_LOCAL?.trim() || "mongodb://127.0.0.1:27017";

const ATLAS_URI =
  process.env.ATLAS_MONGO_URI?.trim() ||
  process.env.MONGO_URI?.trim();

const COLLECTION_NAME = "products";

function maskUri(uri = "") {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@");
}

async function main() {
  if (!ATLAS_URI) {
    throw new Error(
      "Falta ATLAS_MONGO_URI o MONGO_URI para conectar a Atlas."
    );
  }

  console.log("🚀 Iniciando migración de productos...");
  console.log(`📦 Base local origen: ${LOCAL_DB_NAME}`);
  console.log(`☁️  Base destino Atlas: ${PROD_DB_NAME}`);
  console.log(`🔗 Local URI: ${LOCAL_URI}/${LOCAL_DB_NAME}`);
  console.log(`🔗 Atlas URI: ${maskUri(ATLAS_URI)}`);

  const localConn = await mongoose.createConnection(
    `${LOCAL_URI}/${LOCAL_DB_NAME}`
  ).asPromise();

  const atlasConn = await mongoose.createConnection(ATLAS_URI, {
    dbName: PROD_DB_NAME,
  }).asPromise();

  try {
    const localCollection = localConn.db.collection(COLLECTION_NAME);
    const atlasCollection = atlasConn.db.collection(COLLECTION_NAME);

    const products = await localCollection.find({}).toArray();

    if (!products.length) {
      console.log("⚠️ No se encontraron productos en la base local.");
      return;
    }

    console.log(`📚 Productos encontrados en local: ${products.length}`);

    const ops = products.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }));

    const result = await atlasCollection.bulkWrite(ops, {
      ordered: false,
    });

    console.log("✅ Migración completada.");
    console.log("📊 Resultado:");
    console.log(`- matchedCount: ${result.matchedCount}`);
    console.log(`- modifiedCount: ${result.modifiedCount}`);
    console.log(`- upsertedCount: ${result.upsertedCount}`);

    const finalCount = await atlasCollection.countDocuments();
    console.log(`📦 Total de productos en Atlas ahora: ${finalCount}`);
  } finally {
    await localConn.close();
    await atlasConn.close();
  }
}

main()
  .then(() => {
    console.log("🏁 Script finalizado correctamente.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error migrando productos:", err.message);
    process.exit(1);
  });