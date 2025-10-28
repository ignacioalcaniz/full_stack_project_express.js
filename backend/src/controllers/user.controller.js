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
      const { accessToken, refreshToken, user } = await this.services.login(req.body);

      // cookie refresh (httpOnly)
      res.cookie(process.env.COOKIE_REFRESH_NAME || "refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      // cookie uid (httpOnly) para identificar usuario en refresh
      res.cookie("uid", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
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
      const rawRefresh = req.cookies[process.env.COOKIE_REFRESH_NAME || "refreshToken"];
      const userId = req.cookies["uid"];

      if (!rawRefresh || !userId) return res.status(401).json({ error: "No refresh token / uid" });

      const { accessToken, refreshToken } = await this.services.refreshTokens(userId, rawRefresh);

      // rota: setear nuevo refresh en cookie y mantener uid
      res.cookie(process.env.COOKIE_REFRESH_NAME || "refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      createResponse(res, 200, { accessToken });
    } catch (error) {
      // devolver genérico por seguridad
      res.status(403).json({ error: "Refresh inválido o expirado" });
    }
  };

  logout = async (req, res, next) => {
    try {
      const rawRefresh = req.cookies[process.env.COOKIE_REFRESH_NAME || "refreshToken"];
      const userId = req.user?.id || req.cookies["uid"];
      if (userId && rawRefresh) {
        await this.services.removeRefreshTokenHash(userId, rawRefresh);
      }
      res.clearCookie(process.env.COOKIE_REFRESH_NAME || "refreshToken", { path: "/" });
      res.clearCookie("uid", { path: "/" });
      createResponse(res, 200, { message: "Logout exitoso" });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController(userServices);




