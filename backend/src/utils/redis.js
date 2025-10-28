// src/utils/redis.js
import { createClient } from "redis";
import logger from "../config/logger.config.js";

const REDIS_URL =
  process.env.REDIS_URL && process.env.REDIS_URL.trim() !== ""
    ? process.env.REDIS_URL
    : process.env.DOCKER_ENV === "true"
    ? "redis://redis:6379"
    : "redis://127.0.0.1:6379";

const REDIS_PASSWORD =
  process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== ""
    ? process.env.REDIS_PASSWORD
    : undefined;

let redisClient;

export const getRedisClient = async () => {
  if (redisClient) return redisClient;
  redisClient = createClient({ url: REDIS_URL, password: REDIS_PASSWORD });

  redisClient.on("connect", () => logger.info(`🧠 Redis conectado: ${REDIS_URL}`));
  redisClient.on("reconnecting", () => logger.warn("♻️  Redis intentando reconexión..."));
  redisClient.on("error", (err) => logger.error(`❌ Error en Redis: ${err.message}`));
  redisClient.on("end", () => logger.warn("⚠️  Conexión Redis finalizada."));

  try {
    await redisClient.connect();
    logger.info("✅ Conexión a Redis establecida correctamente.");
  } catch (err) {
    logger.error(`🚨 No se pudo conectar a Redis: ${err.message}`);
  }

  return redisClient;
};

// ========== Helpers seguros ==========
export const redisGet = async (key) => {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Redis GET error: ${err.message}`);
    return null;
  }
};

export const redisSet = async (key, value, ttl = 60) => {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
    logger.debug(`💾 Redis SET → ${key} (ttl ${ttl}s)`);
  } catch (err) {
    logger.error(`Redis SET error: ${err.message}`);
  }
};

export const redisDel = async (key) => {
  try {
    const client = await getRedisClient();
    await client.del(key);
    logger.debug(`🗑️ Redis DEL → ${key}`);
  } catch (err) {
    logger.error(`Redis DEL error: ${err.message}`);
  }
};

export const redisFlushAll = async () => {
  try {
    const client = await getRedisClient();
    await client.flushAll();
    logger.warn("🧹 Redis cache limpiado completamente.");
  } catch (err) {
    logger.error(`Redis FLUSH error: ${err.message}`);
  }
};


