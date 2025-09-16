import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: "info", // nivel mínimo
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    // Mostrar en consola (útil en desarrollo)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Guardar todos los logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    // Guardar solo errores
    new winston.transports.File({
      filename: path.join(logDir, "errors.log"),
      level: "error",
    }),
  ],
});

export default logger;
