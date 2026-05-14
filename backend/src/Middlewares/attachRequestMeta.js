// src/middlewares/attachRequestMeta.js
const getForwardedFor = (req) => {
  const header = req.headers["x-forwarded-for"];
  if (!header) return "";
  if (Array.isArray(header)) return String(header[0] || "").trim();
  return String(header).split(",")[0].trim();
};

const getUserAgent = (req) => req.get("user-agent") || "";

export const attachRequestMeta = (req, _res, next) => {
  req.requestMeta = {
    method: req.method,
    route: req.originalUrl,
    ip: req.ip || req.socket?.remoteAddress || "",
    forwardedFor: getForwardedFor(req),
    userAgent: getUserAgent(req),
  };

  next();
};
