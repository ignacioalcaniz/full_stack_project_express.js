// src/config/logger.config.js
import winston from "winston";
import path from "path";
import fs from "fs";

// =============================
// ⚙️ DETECCIÓN DE ENTORNO
// =============================
const isCI =
  process.env.CI === "true" ||
  process.env.ZAP_ENV === "true" ||
  process.env.GITHUB_ACTIONS === "true";

const isDocker = process.env.DOCKER_ENV === "true";

// =============================
// 📁 DIRECTORIO DE LOGS
// =============================
// En producción real → SÍ debe existir.
// En CI/ZAP/DockerBuild → NO se crea (evita errores de permisos).
let logDir = null;

if (!isCI && !isDocker) {
  // Desarrollo local
  logDir = path.join(process.cwd(), "logs");
} else if (process.env.NODE_ENV === "production" && !isCI) {
  // Producción real en servidor docker / VPS
  logDir = "/app/logs";
}

// Si hay directorio asignado → crearlo
if (logDir) {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      console.log(`📁 Carpeta de logs creada en ${logDir}`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo crear la carpeta de logs:", err.message);
    logDir = null; // Fallback seguro
  }
}

// =============================
// 🎨 FORMATOS WINSTON
// =============================
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

// =============================
// 🚀 TRANSPORTES
// =============================
// Siempre consola
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Solo archivos cuando HAY PERMISOS (prod real o dev)
if (logDir) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      level: "info",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "errors.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

// =============================
// 📝 LOGGER FINAL
// =============================
const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports,
});

export default logger;


