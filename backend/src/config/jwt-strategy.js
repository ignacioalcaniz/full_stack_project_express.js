// src/config/jwt-strategy.js
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { userServices } from "../services/user.services.js";
import { isTokenRevoked } from "../Middlewares/token.revocation.js";
import "dotenv/config";

const cookieExtractor = (req) => req?.cookies?.token || null;

const strategyConfig = {
  // ✅ Bearer OR Cookie
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    cookieExtractor,
  ]),
  secretOrKey: process.env.JWT_SECRET, // ✅ un solo secret
  ignoreExpiration: false,
  algorithms: ["HS256"],
};

const verifyToken = async (jwt_payload, done) => {
  try {
    const userId = jwt_payload?.sub || jwt_payload?.id;
    if (!userId) return done(null, false, { message: "Token inválido" });

    if (jwt_payload.jti && (await isTokenRevoked(jwt_payload.jti))) {
      return done(null, false, { message: "Token revocado" });
    }

    const user = await userServices.getUserById(userId);
    if (!user) return done(null, false, { message: "Usuario no encontrado" });

    // ✅ bloqueo administrativo
    if (user.suspended) {
      return done(null, false, { message: "Usuario suspendido" });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

passport.use("jwt", new JwtStrategy(strategyConfig, verifyToken));
export default passport;













