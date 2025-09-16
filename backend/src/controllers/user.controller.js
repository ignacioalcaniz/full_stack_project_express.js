import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

class UserController {
  constructor(services) {
    this.services = services;
  }

  register = async (req, res, next) => {
    try {
      const data = await this.services.register(req.body);
      req.logger.info(`Usuario registrado: ${data.email || "nuevo usuario"}`);
      createResponse(res, 201, data);
    } catch (error) {
      req.logger.error("Error al registrar usuario: " + error.message);
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const token = await this.services.login(req.body);
      res.cookie("token", token, { httpOnly: true });
      req.logger.info(`Usuario logueado: ${req.body.email}`);
      createResponse(res, 200, { token });
    } catch (error) {
      req.logger.warn(
        `Intento fallido de login para ${req.body.email || "email desconocido"}`
      );
      req.logger.error("Error en login: " + error.message);
      next(error);
    }
  };

  profile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await this.services.getUserById(id);
      if (!user) {
        req.logger.warn(`Perfil no encontrado para ID ${id}`);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      req.logger.info(`Perfil accedido para ID ${id}`);
      createResponse(res, 200, user);
    } catch (error) {
      req.logger.error("Error al obtener perfil: " + error.message);
      next(error);
    }
  };
}

export const userController = new UserController(userServices);
