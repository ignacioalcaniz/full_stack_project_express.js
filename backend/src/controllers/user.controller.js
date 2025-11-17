// src/controllers/user.controller.js
import jwt from "jsonwebtoken";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";
import { revokeToken } from "../Middlewares/token.revocation.js";
import { enforceStrongPassword } from "../Middlewares/password.policy.js";
import { generate2FASecret, generate2FAQrDataUrl, verify2FAToken } from "../utils/2fa.util.js";

class UserController {
  constructor(services) {
    this.services = services;
  }

  // --- Registro ---
  register = async (req, res, next) => {
    try {
      enforceStrongPassword(req.body.password);
      const data = await this.services.register(req.body);
      createResponse(res, 201, data);
    } catch (error) {
      next(error);
    }
  };

  // --- Login con soporte 2FA ---
  login = async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await this.services.login(req.body);

      // Si el usuario tiene 2FA habilitado y no envió código
      if (user.twoFASecret && !req.body.twoFAToken) {
        return res.status(206).json({
          message: "2FA requerido. Ingresa el código de autenticación.",
          twoFARequired: true,
        });
      }

      // Si tiene 2FA habilitado, verificar código
      if (user.twoFASecret && req.body.twoFAToken) {
        const isValid = verify2FAToken(user.twoFASecret, req.body.twoFAToken);
        if (!isValid) return res.status(401).json({ error: "Código 2FA inválido" });
      }

      res.cookie(process.env.COOKIE_REFRESH_NAME || "refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.cookie("uid", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      createResponse(res, 200, { accessToken });
    } catch (error) {
      next(error);
    }
  };

  // --- Generar secreto y QR para 2FA ---
  setup2FA = async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "No autenticado" });

      const { secret, otpauth } = generate2FASecret(user.email);
      const qr = await generate2FAQrDataUrl(otpauth);

      await this.services.updateUser(user._id, { twoFASecret: secret });

      return res.status(200).json({
        message: "2FA generado. Escanea el QR en Google Authenticator.",
        qr,
      });
    } catch (error) {
      next(error);
    }
  };

  // --- Verificar código y activar 2FA ---
  verify2FA = async (req, res, next) => {
    try {
      const { code } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ error: "No autenticado" });

      const freshUser = await this.services.getUserById(user._id);
      if (!freshUser.twoFASecret) return res.status(400).json({ error: "2FA no configurado" });

      const valid = verify2FAToken(freshUser.twoFASecret, code);
      if (!valid) return res.status(401).json({ error: "Código 2FA inválido" });

      return res.status(200).json({ message: "2FA verificado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  // --- Perfil ---
  profile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await this.services.getUserById(id);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
      createResponse(res, 200, user);
    } catch (error) {
      next(error);
    }
  };

  // --- Refresh token ---
  refresh = async (req, res, next) => {
    try {
      const rawRefresh = req.cookies[process.env.COOKIE_REFRESH_NAME || "refreshToken"];
      const userId = req.cookies["uid"];
      if (!rawRefresh || !userId) return res.status(401).json({ error: "No refresh token / uid" });

      const { accessToken, refreshToken } = await this.services.refreshTokens(userId, rawRefresh);

      res.cookie(process.env.COOKIE_REFRESH_NAME || "refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      createResponse(res, 200, { accessToken });
    } catch (error) {
      res.status(403).json({ error: "Refresh inválido o expirado" });
    }
  };

  // --- Logout (revoca tokens) ---
  logout = async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (token) {
        const decoded = jwt.decode(token);
        if (decoded?.jti) await revokeToken(decoded.jti);
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






