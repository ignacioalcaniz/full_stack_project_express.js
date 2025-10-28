// src/middlewares/error.handler.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (req?.logger) {
    req.logger.error(`❌ ${message}`, { stack: err.stack });
  } else {
    console.error("❌", message, err.stack);
  }

  res.status(status).json({
    status: "error",
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
