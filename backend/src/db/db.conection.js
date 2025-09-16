import { connect } from "mongoose";

export const initMongoDb = async () => {
  try {
    await connect(process.env.MONGO_URL);
    console.log("Conectado a MongoDB ✅");
  } catch (error) {
    throw new Error(error);
  }
};
