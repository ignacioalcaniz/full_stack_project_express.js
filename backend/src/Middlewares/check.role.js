// src/Middlewares/check.role.js
import { CustomError } from "../utils/error.custom.js";

export const checkRole = (roles = []) => {
  const list = Array.isArray(roles) ? roles : [roles];

  return (req, _res, next) => {
    try {
      if (!req.user) throw new CustomError("No autorizado", 401);

      if (!list.includes(req.user.role)) {
        throw new CustomError("No tiene permisos para acceder a este recurso", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

