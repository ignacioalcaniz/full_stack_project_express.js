import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => console.log("🧠 Redis conectado correctamente"));
redisClient.on("error", (err) => console.error("❌ Error en Redis:", err));

await redisClient.connect();

/**
 * Cache middleware: cachea respuestas GET por X segundos
 */
export const cacheMiddleware = (seconds = 60) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redisClient.get(key);

  if (cached) {
    console.log(`📦 Respuesta cacheada: ${req.originalUrl}`);
    return res.json(JSON.parse(cached));
  }

  const sendResponse = res.json.bind(res);
  res.json = (data) => {
    redisClient.setEx(key, seconds, JSON.stringify(data));
    return sendResponse(data);
  };

  next();
};

