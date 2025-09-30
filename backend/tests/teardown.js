// backend/tests/teardown.js
import mongoose from "mongoose";


export default async function teardown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
