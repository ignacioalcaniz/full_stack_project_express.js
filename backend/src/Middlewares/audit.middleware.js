// src/Middlewares/audit.middleware.js
import logger from "../config/logger.config.js"; // <- con .js

export const auditMiddleware = (req, res, next) => {
  const dangerous = /(\b(eval|<script>|union\s+select|drop\s+table)\b)/i;

  // stringify defensivo para cuerpos grandes o circulares
  let bodyStr = "";
  try { bodyStr = JSON.stringify(req.body); } catch { bodyStr = ""; }

  if (dangerous.test(req.url) || dangerous.test(bodyStr)) {
    logger.warn(`🚨 Posible intento malicioso en ${req.method} ${req.url}`);
  }
  next();
};


