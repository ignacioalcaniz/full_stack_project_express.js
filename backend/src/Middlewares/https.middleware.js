// src/Middlewares/https.middleware.js
import fs from "fs";
import https from "https";

export function createHttpsServer(app) {
  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    console.warn("⚠️  HTTPS activado pero faltan certificados.");
    return null;
  }

  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  console.log("🔐 Servidor HTTPS habilitado.");
  return https.createServer(options, app);
}
