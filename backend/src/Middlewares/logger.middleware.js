import logger from "../config/logger.config.js";

export const addLogger = (req, res, next) => {
  req.logger = logger;
  next();
};


export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    req.logger.info(
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
