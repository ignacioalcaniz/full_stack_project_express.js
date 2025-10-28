import helmet from "helmet";

export const cspMiddleware = (req, res, next) => {
  if (req.path.startsWith("/api/docs")) return next();

  return helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"], // Swagger necesita inline
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
  })(req, res, next);
};
