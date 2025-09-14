import { CustomError } from "../utils/error.custom.js";

export const checkRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) throw new CustomError("No autorizado", 401);
      console.log("Usuario autenticado:", req.user);
      if (!roles.includes(req.user.role))
        throw new CustomError("No tiene permisos para acceder a este recurso", 403);
      next();
    } catch (error) {
      next(error);
    }
  };
};