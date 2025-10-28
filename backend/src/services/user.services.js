// src/services/user.services.js
import jwt from "jsonwebtoken";
import "dotenv/config";
import { CustomError } from "../utils/error.custom.js";
import { userDaoMongo } from "../daos/user.dao.js";
import { sendWelcomeEmail } from "./email.services.js";
import { CartDao } from "../daos/cart.dao.js";
import { generateRandomToken, hashToken } from "../utils/tokens.js";

class UserServices {
  constructor(dao) {
    this.dao = dao;
  }

  // crea access token (JWT) — corto
  signAccessToken = (user) => {
    const payload = { id: user._id.toString(), role: user.role, cart: user.cart };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    });
  };

  // Crear y almacenar refresh token (raw devuelto, hash guardado)
  createAndStoreRefreshToken = async (user) => {
    const raw = generateRandomToken(48);
    const tokenHash = hashToken(raw);

    const expiresDays = parseInt(
      (process.env.REFRESH_TOKEN_EXPIRES || "7d").replace(/\D/g, "") || "7",
      10
    );
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const userDoc = await this.dao.getUserById(user._id.toString());
    if (!userDoc) throw new CustomError("Usuario no encontrado al crear refresh", 404);

    userDoc.refreshTokens = userDoc.refreshTokens || [];
    userDoc.refreshTokens.push({ tokenHash, createdAt: new Date(), expiresAt });
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
    const found = (userDoc.refreshTokens || []).find((t) => t.tokenHash === tokenHash);
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

    // ❌ antes: password: createHash(password)
    // ✅ ahora dejamos que el modelo lo hashee automáticamente (hook pre-save)
    const created = await this.dao.create({
      ...user,
      role: isAdmin ? "admin" : user.role || "user",
      cart: cartUser._id,
    });

    sendWelcomeEmail({ first_name: created.first_name, email: created.email }).catch(
      (err) => console.error("⚠️ Error enviando email bienvenida:", err.message)
    );

    return created;
  };

  login = async ({ email, password }) => {
    const userExist = await this.getByEmail(email);
    if (!userExist) throw new CustomError("Credenciales incorrectas", 401);

    const passValid = await userExist.comparePassword(password);
    if (!passValid) throw new CustomError("Credenciales incorrectas", 401);

    const { accessToken, refreshToken } = await this.generateTokensForUser(userExist);
    return { accessToken, refreshToken, user: userExist };
  };

  refreshTokens = async (userId, rawRefresh) => {
    const isValid = await this.isValidRefreshToken(userId, rawRefresh);
    if (!isValid) throw new CustomError("Refresh inválido o expirado", 403);

    await this.removeRefreshTokenHash(userId, rawRefresh);
    const user = await this.dao.getUserById(userId);
    if (!user) throw new CustomError("Usuario no encontrado", 404);

    const { accessToken, refreshToken } = await this.generateTokensForUser(user);
    return { accessToken, refreshToken };
  };

  getUserById = async (id) => {
    const user = await this.dao.getUserById(id);
    if (!user) throw new CustomError("Usuario no encontrado", 404);
    user.first_name = user.first_name || "Cliente";
    return user;
  };
}

export const userServices = new UserServices(userDaoMongo);










