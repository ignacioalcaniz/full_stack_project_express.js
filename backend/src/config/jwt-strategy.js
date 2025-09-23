import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { userServices } from "../services/user.services.js";
import "dotenv/config";

const strategyConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const verifyToken = async (jwt_payload, done) => {
  try {
    if (!jwt_payload) return done(null, false, { messages: "Invalid Token" });

    // Traemos el usuario completo de DB
    const user = await userServices.getUserById(jwt_payload.id);
    if (!user) return done(null, false, { messages: "Usuario no encontrado" });

    return done(null, user); // Objeto completo
  } catch (error) {
    return done(error, false);
  }
};

passport.use("jwt", new Strategy(strategyConfig, verifyToken));

export default passport;










