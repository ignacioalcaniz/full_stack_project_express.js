// src/middlewares/maintenance.middleware.js
export function maintenanceGuard(req, res, next) {
  const s = req.settings;

  const isMaintenance = Boolean(s?.maintenanceMode);
  if (!isMaintenance) return next();

  const path = req.path || "";
  const isAdminRoute = path.startsWith("/admin");
  const isHealth = path === "/health" || path === "/";
  const isDocs = path.startsWith("/api/docs");
  const isAuthRefresh = path === "/users/refresh" || path === "/users/login" || path === "/users/register";

  if (isAdminRoute || isHealth || isDocs || isAuthRefresh) return next();

  return res.status(503).json({
    error: "Sitio en mantenimiento. Volvé a intentar en unos minutos.",
  });
}