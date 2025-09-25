// src/server.js
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { initMongoDb } from "./db/db.conection.js";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

let httpServer;
let socketServer;

if (process.env.NODE_ENV !== "test") {
  // Conexión a MongoDB real solo si NO estamos en test
  initMongoDb()
    .then(() => console.log("✅ Conectado a la base de datos de MongoDB"))
    .catch((error) => console.error("❌ Error MongoDB:", error));

  const PORT = process.env.PORT || 8080;
  httpServer = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

  // Socket.IO
  socketServer = new Server(httpServer);
  socketServer.on("connection", (socket) => {
    console.log("New connection:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

export default app  ; // exportamos para tests









