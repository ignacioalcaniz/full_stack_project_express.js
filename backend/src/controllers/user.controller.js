import jwt from "jsonwebtoken";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";
import { revokeToken } from "../Middlewares/token.revocation.js";
import { enforceStrongPassword } from "../Middlewares/password.policy.js";

const REFRESH_COOKIE_NAME = process.env.COOKIE_REFRESH_NAME || "refreshToken";

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

class UserController {
  constructor(services) {
    this.services = services;
  }

  register = async (req, res, next) => {
    try {
      enforceStrongPassword(
        req.body.password,
        req.settings?.passwordPolicy || "medium"
      );
      const data = await this.services.register(req.body);
      createResponse(res, 201, data);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.services.login({
        ...req.body,
        requestMeta: req.requestMeta || {},
      });

      if (result.emailOtpRequired) {
        return res.status(206).json({
          emailOtpRequired: true,
          pendingToken: result.pendingToken,
          message: "Te enviamos un código por email para verificar el login.",
        });
      }

      const cookieOptions = getCookieOptions();

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);
      res.cookie("uid", result.user._id.toString(), cookieOptions);

      return createResponse(res, 200, { accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  };

  verifyLoginEmailOtp = async (req, res, next) => {
    try {
      const { pendingToken, code, deviceId } = req.body;

      const { user, accessToken, refreshToken } =
        await this.services.verifyLoginEmailOtp({
          pendingToken,
          code,
          deviceId,
          requestMeta: req.requestMeta || {},
        });

      const cookieOptions = getCookieOptions();

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
      res.cookie("uid", user._id.toString(), cookieOptions);

      createResponse(res, 200, { accessToken });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();

      const result = await this.services.requestPasswordReset(email);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  validateResetPasswordToken = async (req, res, next) => {
    try {
      const token = String(req.query?.token || "").trim();
      const result = await this.services.validatePasswordResetToken(token);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      enforceStrongPassword(
        newPassword,
        req.settings?.passwordPolicy || "medium"
      );

      const result = await this.services.resetPassword({
        token,
        newPassword,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  setup2FA = async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const result = await this.services.enableEmailOtpForUser(user._id);

      return res.status(200).json({
        data: result,
        message: "Te enviamos un código por email para activar la verificación.",
      });
    } catch (error) {
      next(error);
    }
  };

  verify2FA = async (req, res, next) => {
    try {
      const { code } = req.body;
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const updated = await this.services.verifyEnableEmailOtpForUser(
        user._id,
        code
      );

      return res.status(200).json({
        data: updated,
        message: "Verificación por email activada correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  profile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const profile = await this.services.getProfileById(id);
      createResponse(res, 200, profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const updated = await this.services.updateProfile(id, req.body);
      createResponse(res, 200, updated);
    } catch (error) {
      next(error);
    }
  };

  updateSecurityPreferences = async (req, res, next) => {
    try {
      const { id } = req.user;
      const updated = await this.services.updateSecurityPreferences(id, req.body);
      createResponse(res, 200, updated);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { id } = req.user;
      const { currentPassword, newPassword } = req.body;

      const updated = await this.services.changePassword(
        id,
        currentPassword,
        newPassword
      );

      createResponse(res, 200, updated);
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req, res, next) => {
    try {
      const { id } = req.user;
      const orders = await this.services.getMyOrders(id);
      createResponse(res, 200, { orders });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const rawRefresh = req.cookies[REFRESH_COOKIE_NAME];
      const userId = req.cookies["uid"];

      if (!rawRefresh || !userId) {
        return res.status(401).json({ error: "No refresh token / uid" });
      }

      const { accessToken, refreshToken } = await this.services.refreshTokens(
        userId,
        rawRefresh
      );

      const cookieOptions = getCookieOptions();

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

      return createResponse(res, 200, { accessToken });
    } catch (_error) {
      return res.status(403).json({ error: "Refresh inválido o expirado" });
    }
  };

  logout = async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

      if (token) {
        const decoded = jwt.decode(token);
        if (decoded?.jti) {
          await revokeToken(decoded.jti);
        }
      }

      const cookieOptions = getCookieOptions();

      res.clearCookie(REFRESH_COOKIE_NAME, { path: cookieOptions.path });
      res.clearCookie("uid", { path: cookieOptions.path });

      createResponse(res, 200, { message: "Logout exitoso" });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController(userServices);








