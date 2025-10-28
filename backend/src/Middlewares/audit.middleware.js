// src/Middlewares/audit.middleware.js
import logger from "../config/logger.config.js";

export const auditMiddleware = (req, res, next) => {
  const dangerous = /(\b(eval|<script>|union\s+select|drop\s+table)\b)/i;
  if (dangerous.test(req.url) || dangerous.test(JSON.stringify(req.body))) {
    logger.warn(`🚨 Posible intento malicioso en ${req.method} ${req.url}`);
  }
  next();
};

