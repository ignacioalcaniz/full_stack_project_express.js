// src/config/jwt-strategy.js
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
    if (!jwt_payload) return done(null, false);

    // Traemos el usuario completo
    const user = await userServices.getUserById(jwt_payload.id);
    if (!user) return done(null, false);

    return done(null, user); // 🔥 devolvemos el objeto completo
  } catch (error) {
    return done(error, false);
  }
};

passport.use("jwt", new Strategy(strategyConfig, verifyToken));








