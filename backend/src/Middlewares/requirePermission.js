// src/Middlewares/requirePermission.js
import { CustomError } from "../utils/error.custom.js";
import { roleHasPermission } from "../config/permissions.js";

export const requirePermission = (permission) => {
  return (req, _res, next) => {
    try {
      if (!req.user) throw new CustomError("No autorizado", 401);

      // permisos por usuario (si existen) + fallback por rol
      const userPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];

      const ok =
        userPerms.includes("*") ||
        userPerms.includes(permission) ||
        roleHasPermission(req.user.role, permission);

      if (!ok) throw new CustomError("No tiene permisos para esta acción", 403);

      next();
    } catch (err) {
      next(err);
    }
  };
};

