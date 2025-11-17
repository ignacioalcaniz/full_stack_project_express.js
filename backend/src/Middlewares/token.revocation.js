// src/Middlewares/token.revocation.js
// Revocación de tokens (jti). Por defecto en memoria.
// Si USE_REDIS_TOKEN_STORE = true, usa Redis (opcional).

import { createClient } from "redis";

const useRedis = String(process.env.USE_REDIS_TOKEN_STORE || "false") === "true";
let redisClient = null;
const inMemoryRevoked = new Set();

if (useRedis) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on("error", (err) => console.error("Redis error:", err));
  // No await aquí para no bloquear import; conecta lazy en primera operación
}

export async function revokeToken(jti, ttlSeconds = 60 * 60 * 24 * 7) {
  if (!jti) return;
  if (useRedis) {
    if (!redisClient?.isOpen) await redisClient.connect();
    await redisClient.set(`revoked:${jti}`, "1", { EX: ttlSeconds });
  } else {
    inMemoryRevoked.add(jti);
    setTimeout(() => inMemoryRevoked.delete(jti), ttlSeconds * 1000);
  }
}

export async function isTokenRevoked(jti) {
  if (!jti) return false;
  if (useRedis) {
    if (!redisClient?.isOpen) await redisClient.connect();
    const val = await redisClient.get(`revoked:${jti}`);
    return Boolean(val);
  }
  return inMemoryRevoked.has(jti);
}
