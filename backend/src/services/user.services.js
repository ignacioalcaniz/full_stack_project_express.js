import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";
import { CustomError } from "../utils/error.custom.js";
import { userDaoMongo } from "../daos/user.dao.js";
import { createHash, isValidPassword } from "../utils/user.utils.js";
import {
  sendWelcomeEmail,
  sendEmailOtp,
  sendResetPasswordEmail,
} from "./email.services.js";
import { CartDao } from "../daos/cart.dao.js";
import { generateRandomToken, hashToken } from "../utils/tokens.js";
import { ticketServices } from "./ticket.services.js";

class UserServices {
  constructor(dao) {
    this.dao = dao;
  }

  signAccessToken = (user) => {
    const payload = {
      id: user._id.toString(),
      role: user.role,
      cart: user.cart,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    });
  };

  signPendingOtpToken = (user, purpose) => {
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        purpose,
        kind: "email-otp",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
  };

  verifyPendingOtpToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new CustomError("Token OTP inválido o expirado", 401);
    }
  };

  signPasswordResetToken = (user) => {
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        kind: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.PASSWORD_RESET_EXPIRES || "15m" }
    );
  };

  verifyPasswordResetToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new CustomError("Token de recuperación inválido o expirado", 401);
    }
  };

  parsePasswordResetCompositeToken = (compositeToken) => {
    const parts = String(compositeToken || "").split(".");

    if (parts.length < 4) {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    const signedToken = parts.slice(0, 3).join(".");
    const rawToken = parts.slice(3).join(".");

    if (!signedToken || !rawToken) {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    return { signedToken, rawToken };
  };

  generateEmailOtpCode = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  hashEmailOtpCode = (code) => {
    return crypto.createHash("sha256").update(String(code)).digest("hex");
  };

  normalizeIp = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("::ffff:")) return raw.replace("::ffff:", "");
    if (raw === "::1") return "127.0.0.1";
    return raw;
  };

  normalizeUserAgent = (value = "") => String(value || "").trim();

  normalizeDeviceId = (value = "") => String(value || "").trim();

  resolveLoginContext = (requestMeta = {}) => {
    const ip = this.normalizeIp(requestMeta.forwardedFor || requestMeta.ip || "");
    const userAgent = this.normalizeUserAgent(requestMeta.userAgent || "");
    return { ip, userAgent };
  };

  getSensitiveLoginMaxAgeDays = () =>
    Number(process.env.SENSITIVE_LOGIN_MAX_AGE_DAYS || 30);

  getRecentPasswordChangeHours = () =>
    Number(process.env.SENSITIVE_PASSWORD_CHANGE_HOURS || 24);

  getResetPasswordUrl = (token) => {
    const frontendBase =
      process.env.FRONTEND_URL?.trim() ||
      "https://www.thelibrarystore.it.com";

    const normalized = frontendBase.endsWith("/")
      ? frontendBase.slice(0, -1)
      : frontendBase;

    return `${normalized}/reset-password?token=${encodeURIComponent(token)}`;
  };

  wasLoginTooOld = (user) => {
    if (!user.lastLoginAt) return true;
    const maxAgeDays = this.getSensitiveLoginMaxAgeDays();
    const diffMs = Date.now() - new Date(user.lastLoginAt).getTime();
    return diffMs > maxAgeDays * 24 * 60 * 60 * 1000;
  };

  wasPasswordRecentlyChanged = (user) => {
    if (!user.passwordChangedAt) return false;
    const recentHours = this.getRecentPasswordChangeHours();
    const diffMs = Date.now() - new Date(user.passwordChangedAt).getTime();
    return diffMs <= recentHours * 60 * 60 * 1000;
  };

  findTrustedDevice = (user, deviceId) => {
    const normalizedDeviceId = this.normalizeDeviceId(deviceId);
    if (!normalizedDeviceId) return null;
    return (user.trustedDevices || []).find(
      (device) => device.deviceId === normalizedDeviceId
    );
  };

  isNewDevice = (user, deviceId) => {
    const normalizedDeviceId = this.normalizeDeviceId(deviceId);
    if (!normalizedDeviceId) return false;
    return !this.findTrustedDevice(user, normalizedDeviceId);
  };

  isNewIp = (user, currentIp, trustedDevice = null) => {
    const normalizedIp = this.normalizeIp(currentIp);
    if (!normalizedIp) return false;

    if (trustedDevice?.lastIp) {
      return this.normalizeIp(trustedDevice.lastIp) !== normalizedIp;
    }

    if (user.lastLoginIp) {
      return this.normalizeIp(user.lastLoginIp) !== normalizedIp;
    }

    return false;
  };

  getSensitiveLoginReason = ({
    user,
    deviceId,
    trustedDevice,
    ip,
    passwordRecentlyChanged,
  }) => {
    if (user.role === "admin") {
      return "verificación adicional de acceso";
    }

    if (Boolean(user.emailOtpEnabled)) {
      return "verificación adicional de acceso";
    }

    if (this.isNewDevice(user, deviceId)) {
      return "nuevo acceso detectado";
    }

    if (this.isNewIp(user, ip, trustedDevice)) {
      return "nuevo acceso detectado";
    }

    if (this.wasLoginTooOld(user)) {
      return "verificación de acceso";
    }

    if (passwordRecentlyChanged) {
      return "verificación de seguridad";
    }

    return "verificación de acceso";
  };

  shouldRequireStepUpAuth = ({ user, deviceId, ip }) => {
    const bypassStepUpAuth =
      process.env.NODE_ENV === "test" ||
      process.env.CI === "true" ||
      process.env.ZAP_ENV === "true" ||
      process.env.DISABLE_STEP_UP_AUTH === "true";

    if (bypassStepUpAuth) {
      return {
        shouldRequire: false,
        trustedDevice: null,
        reason: null,
      };
    }

    const trustedDevice = this.findTrustedDevice(user, deviceId);
    const passwordRecentlyChanged = this.wasPasswordRecentlyChanged(user);

    const shouldRequire =
      user.role === "admin" ||
      Boolean(user.emailOtpEnabled) ||
      this.isNewDevice(user, deviceId) ||
      this.isNewIp(user, ip, trustedDevice) ||
      this.wasLoginTooOld(user) ||
      passwordRecentlyChanged;

    return {
      shouldRequire,
      trustedDevice,
      reason: shouldRequire
        ? this.getSensitiveLoginReason({
            user,
            deviceId,
            trustedDevice,
            ip,
            passwordRecentlyChanged,
          })
        : null,
    };
  };

  updateLoginMetadata = async ({ user, deviceId, ip, userAgent }) => {
    const now = new Date();
    const normalizedDeviceId = this.normalizeDeviceId(deviceId);
    const normalizedIp = this.normalizeIp(ip);
    const normalizedUserAgent = this.normalizeUserAgent(userAgent);

    user.lastLoginAt = now;
    user.lastLoginIp = normalizedIp;
    user.lastLoginUserAgent = normalizedUserAgent;

    user.trustedDevices = user.trustedDevices || [];

    if (normalizedDeviceId) {
      const existingDevice = user.trustedDevices.find(
        (device) => device.deviceId === normalizedDeviceId
      );

      if (existingDevice) {
        existingDevice.userAgent = normalizedUserAgent;
        existingDevice.lastIp = normalizedIp;
        existingDevice.lastUsedAt = now;
      } else {
        user.trustedDevices.push({
          deviceId: normalizedDeviceId,
          userAgent: normalizedUserAgent,
          lastIp: normalizedIp,
          createdAt: now,
          lastUsedAt: now,
        });
      }
    }

    await user.save();
  };

  createAndStoreRefreshToken = async (user) => {
    const raw = generateRandomToken(48);
    const tokenHash = hashToken(raw);

    const expiresDays = parseInt(
      (process.env.REFRESH_TOKEN_EXPIRES || "7d").replace(/\D/g, "") || "7",
      10
    );

    const expiresAt = new Date(
      Date.now() + expiresDays * 24 * 60 * 60 * 1000
    );

    const userDoc = await this.dao.getUserById(user._id.toString());
    if (!userDoc) {
      throw new CustomError("Usuario no encontrado al crear refresh", 404);
    }

    userDoc.refreshTokens = userDoc.refreshTokens || [];
    userDoc.refreshTokens.push({
      tokenHash,
      createdAt: new Date(),
      expiresAt,
    });

    await userDoc.save();

    return raw;
  };

  removeRefreshTokenHash = async (userId, rawToken) => {
    try {
      const tokenHash = hashToken(rawToken);
      const userDoc = await this.dao.getUserById(userId);
      if (!userDoc) return;

      userDoc.refreshTokens = (userDoc.refreshTokens || []).filter(
        (t) => t.tokenHash !== tokenHash
      );

      await userDoc.save();
    } catch (error) {
      console.error("Error removing refresh token hash:", error);
    }
  };

  isValidRefreshToken = async (userId, rawToken) => {
    const tokenHash = hashToken(rawToken);
    const userDoc = await this.dao.getUserById(userId);
    if (!userDoc) return false;

    const found = (userDoc.refreshTokens || []).find(
      (t) => t.tokenHash === tokenHash
    );

    if (!found) return false;

    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      userDoc.refreshTokens = userDoc.refreshTokens.filter(
        (t) => t.tokenHash !== tokenHash
      );
      await userDoc.save();
      return false;
    }

    return true;
  };

  generateTokensForUser = async (user) => {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.createAndStoreRefreshToken(user);
    return { accessToken, refreshToken };
  };

  getByEmail = async (email) => this.dao.getByEmail(email);

  register = async (user) => {
    const { email, password } = user;

    const existUser = await this.dao.getByEmail(email);
    if (existUser) throw new CustomError("El usuario ya existe", 404);

    const cartUser = await CartDao.create();

    const isAdmin =
      email === process.env.EMAIL_ADMIN && password === process.env.PASS_ADMIN;

    const created = await this.dao.create({
      ...user,
      password: createHash(password),
      role: isAdmin ? "admin" : user.role || "user",
      cart: cartUser._id,
      avatarUrl: "",
      phone: "",
      address: "",
      preferences: {
        newsletter: true,
        notifications: true,
        publicProfile: false,
      },
      securityPreferences: {
        loginAlerts: true,
        purchaseAlerts: true,
      },
      emailOtpEnabled: Boolean(isAdmin),
      trustedDevices: [],
      lastLoginAt: null,
      lastLoginIp: "",
      lastLoginUserAgent: "",
      passwordChangedAt: null,
      passwordReset: {
        tokenHash: null,
        expiresAt: null,
        requestedAt: null,
      },
    });

    sendWelcomeEmail({
      first_name: created.first_name,
      email: created.email,
    }).catch((err) =>
      console.error("⚠️ Error enviando email bienvenida:", err.message)
    );

    return created;
  };

  login = async ({ email, password, deviceId = "", requestMeta = {} }) => {
    const userExist = await this.getByEmail(email);
    if (!userExist) throw new CustomError("Credenciales incorrectas", 401);

    const passValid = isValidPassword(password, userExist.password);
    if (!passValid) throw new CustomError("Credenciales incorrectas", 401);

    const { ip, userAgent } = this.resolveLoginContext(requestMeta);

    const { shouldRequire, reason } = this.shouldRequireStepUpAuth({
      user: userExist,
      deviceId,
      ip,
    });

    if (shouldRequire) {
      const code = this.generateEmailOtpCode();
      const codeHash = this.hashEmailOtpCode(code);

      userExist.emailOtpCodeHash = codeHash;
      userExist.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      userExist.emailOtpPurpose = "login";
      await userExist.save();

      await sendEmailOtp({
        email: userExist.email,
        first_name: userExist.first_name,
        code,
        reason: reason || "verificación de acceso",
      });

      const pendingToken = this.signPendingOtpToken(userExist, "login");

      return {
        user: userExist,
        emailOtpRequired: true,
        pendingToken,
      };
    }

    await this.updateLoginMetadata({
      user: userExist,
      deviceId,
      ip,
      userAgent,
    });

    const { accessToken, refreshToken } =
      await this.generateTokensForUser(userExist);

    return {
      accessToken,
      refreshToken,
      user: userExist,
      emailOtpRequired: false,
    };
  };

  verifyLoginEmailOtp = async ({
    pendingToken,
    code,
    deviceId = "",
    requestMeta = {},
  }) => {
    const decoded = this.verifyPendingOtpToken(pendingToken);

    if (decoded.kind !== "email-otp" || decoded.purpose !== "login") {
      throw new CustomError("Token OTP inválido", 401);
    }

    const user = await this.dao.getUserById(decoded.sub);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    if (!user.emailOtpCodeHash || !user.emailOtpExpiresAt) {
      throw new CustomError("No hay código pendiente", 400);
    }

    if (new Date(user.emailOtpExpiresAt) < new Date()) {
      user.emailOtpCodeHash = null;
      user.emailOtpExpiresAt = null;
      user.emailOtpPurpose = null;
      await user.save();
      throw new CustomError("El código expiró", 401);
    }

    const incomingHash = this.hashEmailOtpCode(code);
    if (incomingHash !== user.emailOtpCodeHash) {
      throw new CustomError("Código inválido", 401);
    }

    user.emailOtpCodeHash = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    await user.save();

    const { ip, userAgent } = this.resolveLoginContext(requestMeta);

    await this.updateLoginMetadata({
      user,
      deviceId,
      ip,
      userAgent,
    });

    const { accessToken, refreshToken } = await this.generateTokensForUser(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  };

  enableEmailOtpForUser = async (userId) => {
    const user = await this.dao.getUserById(userId);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    const code = this.generateEmailOtpCode();
    const codeHash = this.hashEmailOtpCode(code);

    user.emailOtpCodeHash = codeHash;
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.emailOtpPurpose = "enable-email-otp";
    await user.save();

    await sendEmailOtp({
      email: user.email,
      first_name: user.first_name,
      code,
      reason: "configuración de seguridad",
    });

    return { success: true };
  };

  verifyEnableEmailOtpForUser = async (userId, code) => {
    const user = await this.dao.getUserById(userId);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    if (
      !user.emailOtpCodeHash ||
      !user.emailOtpExpiresAt ||
      user.emailOtpPurpose !== "enable-email-otp"
    ) {
      throw new CustomError("No hay activación pendiente", 400);
    }

    if (new Date(user.emailOtpExpiresAt) < new Date()) {
      user.emailOtpCodeHash = null;
      user.emailOtpExpiresAt = null;
      user.emailOtpPurpose = null;
      await user.save();
      throw new CustomError("El código expiró", 401);
    }

    const incomingHash = this.hashEmailOtpCode(code);
    if (incomingHash !== user.emailOtpCodeHash) {
      throw new CustomError("Código inválido", 401);
    }

    user.emailOtpEnabled = true;
    user.emailOtpCodeHash = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    await user.save();

    return this.buildProfileResponse(user);
  };

  refreshTokens = async (userId, rawRefresh) => {
    const tokenHash = hashToken(rawRefresh);

    const user = await this.dao.getUserById(userId);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    const tokensArr = user.refreshTokens || [];
    const existing = tokensArr.find((t) => t.tokenHash === tokenHash);

    if (!existing) {
      throw new CustomError("Refresh inválido o expirado", 403);
    }

    if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
      user.refreshTokens = tokensArr.filter((t) => t.tokenHash !== tokenHash);
      await user.save();
      throw new CustomError("Refresh inválido o expirado", 403);
    }

    user.refreshTokens = tokensArr.filter((t) => t.tokenHash !== tokenHash);
    await user.save();

    const { accessToken, refreshToken } = await this.generateTokensForUser(user);
    return { accessToken, refreshToken };
  };

  requestPasswordReset = async (email) => {
    const user = await this.dao.getByEmail(email);

    if (!user) {
      return {
        success: true,
        message:
          "Si el correo existe, te enviamos instrucciones para recuperar tu cuenta.",
      };
    }

    const rawToken = generateRandomToken(48);
    const tokenHash = hashToken(rawToken);
    const signedToken = this.signPasswordResetToken(user);

    user.passwordReset = {
      tokenHash,
      expiresAt: new Date(
        Date.now() +
          Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15) *
            60 *
            1000
      ),
      requestedAt: new Date(),
    };

    await user.save();

    const resetUrl = this.getResetPasswordUrl(`${signedToken}.${rawToken}`);

    await sendResetPasswordEmail({
      email: user.email,
      first_name: user.first_name,
      resetUrl,
      expiresMinutes: Number(
        process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15
      ),
    });

    return {
      success: true,
      message:
        "Si el correo existe, te enviamos instrucciones para recuperar tu cuenta.",
    };
  };

  validatePasswordResetToken = async (compositeToken) => {
    const { signedToken, rawToken } =
      this.parsePasswordResetCompositeToken(compositeToken);

    const decoded = this.verifyPasswordResetToken(signedToken);

    if (decoded.kind !== "password-reset") {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    const user = await this.dao.getUserById(decoded.sub);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    if (!user.passwordReset?.tokenHash || !user.passwordReset?.expiresAt) {
      throw new CustomError("No hay recuperación pendiente", 401);
    }

    if (new Date(user.passwordReset.expiresAt) < new Date()) {
      user.passwordReset = {
        tokenHash: null,
        expiresAt: null,
        requestedAt: null,
      };
      await user.save();
      throw new CustomError("El enlace expiró", 401);
    }

    const incomingHash = hashToken(rawToken);
    if (incomingHash !== user.passwordReset.tokenHash) {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    return { success: true };
  };

  resetPassword = async ({ token, newPassword }) => {
    const { signedToken, rawToken } =
      this.parsePasswordResetCompositeToken(token);

    const decoded = this.verifyPasswordResetToken(signedToken);

    if (decoded.kind !== "password-reset") {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    const user = await this.dao.getUserById(decoded.sub);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    if (!user.passwordReset?.tokenHash || !user.passwordReset?.expiresAt) {
      throw new CustomError("No hay recuperación pendiente", 401);
    }

    if (new Date(user.passwordReset.expiresAt) < new Date()) {
      user.passwordReset = {
        tokenHash: null,
        expiresAt: null,
        requestedAt: null,
      };
      await user.save();
      throw new CustomError("El enlace expiró", 401);
    }

    const incomingHash = hashToken(rawToken);
    if (incomingHash !== user.passwordReset.tokenHash) {
      throw new CustomError("Token de recuperación inválido", 401);
    }

    if (isValidPassword(newPassword, user.password)) {
      throw new CustomError(
        "La nueva contraseña no puede ser igual a la actual",
        400
      );
    }

    user.password = createHash(newPassword);
    user.passwordChangedAt = new Date();
    user.passwordReset = {
      tokenHash: null,
      expiresAt: null,
      requestedAt: null,
    };
    user.refreshTokens = [];

    await user.save();

    return {
      success: true,
      message: "Contraseña actualizada correctamente.",
    };
  };

  getUserById = async (id) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);
    return user;
  };

  buildProfileResponse = (user) => {
    return {
      _id: user._id,
      first_name: user.first_name || "Cliente",
      last_name: user.last_name || "",
      email: user.email,
      age: user.age,
      role: user.role || "user",
      avatarUrl: user.avatarUrl || "",
      phone: user.phone || "",
      address: user.address || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      cart: user.cart || null,
      preferences: {
        newsletter: Boolean(user.preferences?.newsletter ?? true),
        notifications: Boolean(user.preferences?.notifications ?? true),
        publicProfile: Boolean(user.preferences?.publicProfile ?? false),
      },
      securityPreferences: {
        loginAlerts: Boolean(user.securityPreferences?.loginAlerts ?? true),
        purchaseAlerts: Boolean(
          user.securityPreferences?.purchaseAlerts ?? true
        ),
      },
      twoFAEnabled: Boolean(user.emailOtpEnabled),
    };
  };

  getProfileById = async (id) => {
    const user = await this.getUserById(id);
    return this.buildProfileResponse(user);
  };

  updateUser = async (id, patch = {}) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    Object.assign(user, patch);
    await user.save();
    return user;
  };

  updateProfile = async (id, patch = {}) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    if (typeof patch.first_name !== "undefined") {
      user.first_name = patch.first_name;
    }

    if (typeof patch.last_name !== "undefined") {
      user.last_name = patch.last_name;
    }

    if (typeof patch.age !== "undefined") {
      user.age = Number(patch.age);
    }

    if (typeof patch.avatarUrl !== "undefined") {
      user.avatarUrl = patch.avatarUrl || "";
    }

    if (typeof patch.phone !== "undefined") {
      user.phone = patch.phone || "";
    }

    if (typeof patch.address !== "undefined") {
      user.address = patch.address || "";
    }

    if (patch.preferences && typeof patch.preferences === "object") {
      user.preferences = {
        newsletter:
          typeof patch.preferences.newsletter === "boolean"
            ? patch.preferences.newsletter
            : user.preferences?.newsletter ?? true,
        notifications:
          typeof patch.preferences.notifications === "boolean"
            ? patch.preferences.notifications
            : user.preferences?.notifications ?? true,
        publicProfile:
          typeof patch.preferences.publicProfile === "boolean"
            ? patch.preferences.publicProfile
            : user.preferences?.publicProfile ?? false,
      };
    }

    await user.save();
    return this.buildProfileResponse(user);
  };

  updateSecurityPreferences = async (id, patch = {}) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    user.securityPreferences = {
      loginAlerts:
        typeof patch.loginAlerts === "boolean"
          ? patch.loginAlerts
          : user.securityPreferences?.loginAlerts ?? true,
      purchaseAlerts:
        typeof patch.purchaseAlerts === "boolean"
          ? patch.purchaseAlerts
          : user.securityPreferences?.purchaseAlerts ?? true,
    };

    await user.save();
    return this.buildProfileResponse(user);
  };

  changePassword = async (id, currentPassword, newPassword) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    const passValid = isValidPassword(currentPassword, user.password);
    if (!passValid) {
      throw new CustomError("La contraseña actual es incorrecta", 401);
    }

    if (isValidPassword(newPassword, user.password)) {
      throw new CustomError(
        "La nueva contraseña no puede ser igual a la actual",
        400
      );
    }

    user.password = createHash(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    return { success: true };
  };

  getMyOrders = async (userId) => {
    const user = await this.getUserById(userId);
    return await ticketServices.getOrdersByUserEmail(user.email);
  };
}

export const userServices = new UserServices(userDaoMongo);










