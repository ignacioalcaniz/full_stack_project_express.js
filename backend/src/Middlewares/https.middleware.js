// src/Middlewares/https.middleware.js
import fs from "fs";
import https from "https";

export function createHttpsServer(app) {
  const { SSL_KEY_PATH, SSL_CERT_PATH } = process.env;

  if (!SSL_KEY_PATH || !SSL_CERT_PATH) {
    console.warn("⚠️  HTTPS no configurado: faltan rutas de certificados.");
    return null;
  }

  if (!fs.existsSync(SSL_KEY_PATH) || !fs.existsSync(SSL_CERT_PATH)) {
    console.warn("⚠️  Archivos SSL no encontrados en las rutas especificadas.");
    return null;
  }

  const options = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
  };

  console.log("🔐 Servidor HTTPS habilitado.");
  return https.createServer(options, app);
}

