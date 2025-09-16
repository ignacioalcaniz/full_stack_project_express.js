export const errorHandler = (err, req, res, next) => {
  req.logger.error(
    `Error en ${req.method} ${req.originalUrl}: ${err.message}`
  );

  res.status(500).json({
    status: "error",
    message: err.message,
  });
};