// src/controllers/user.controller.js
import jwt from "jsonwebtoken";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

class UserController {
  constructor(services) {
    this.services = services;
  }

  register = async (req, res, next) => {
    try {
      const data = await this.services.register(req.body);
      req.logger?.info?.(`🆕 Usuario registrado: ${data.email || "nuevo usuario"}`);
      createResponse(res, 201, data);
    } catch (error) {
      req.logger?.error?.(`❌ Error al registrar usuario: ${error.message}`);
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await this.services.login(req.body);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      createResponse(res, 200, { accessToken });
    } catch (error) {
      next(error);
    }
  };

  profile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await this.services.getUserById(id);

      if (!user) {
        req.logger?.warn?.(`⚠️ Perfil no encontrado para ID ${id}`);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      req.logger?.info?.(`👤 Perfil accedido para ID ${id}`);
      createResponse(res, 200, user);
    } catch (error) {
      req.logger?.error?.(`❌ Error al obtener perfil: ${error.message}`);
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

      const accessToken = jwt.sign(
        { id: payload.id, role: payload.role, cart: payload.cart },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
      );

      createResponse(res, 200, { accessToken });
    } catch (error) {
      res.status(403).json({ error: "Refresh inválido o expirado" });
    }
  };

  logout = async (req, res, next) => {
    try {
      res.clearCookie("refreshToken");
      createResponse(res, 200, { message: "Logout exitoso" });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController(userServices);



