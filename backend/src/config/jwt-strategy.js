// src/config/jwt-strategy.js
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { userServices } from "../services/user.services.js";
import { isTokenRevoked } from "../Middlewares/token.revocation.js";
import "dotenv/config";

const strategyConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  ignoreExpiration: false,
  algorithms: ["HS256"],
};

const verifyToken = async (jwt_payload, done) => {
  try {
    const userId = jwt_payload?.sub || jwt_payload?.id; // ✅ acepta ambos formatos

    if (!userId) {
      console.warn("⚠️ Token sin id ni sub:", jwt_payload);
      return done(null, false, { message: "Token inválido" });
    }

    // 🚫 Revisar si el token fue revocado
    if (jwt_payload.jti && (await isTokenRevoked(jwt_payload.jti))) {
      return done(null, false, { message: "Token revocado" });
    }

    // Buscar usuario en DB
    const user = await userServices.getUserById(userId);
    if (!user) {
      console.warn("⚠️ Usuario no encontrado para ID:", userId);
      return done(null, false, { message: "Usuario no encontrado" });
    }

    return done(null, user);
  } catch (error) {
    console.error("❌ JWT Strategy Error:", error.message);
    return done(error, false);
  }
};

passport.use("jwt", new JwtStrategy(strategyConfig, verifyToken));

export default passport;












