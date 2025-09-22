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

    const user = await userServices.getUserById(jwt_payload.id);
    if (!user) return done(null, false, { messages: "Usuario no encontrado" });

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

passport.use("jwt", new Strategy(strategyConfig, verifyToken));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userServices.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});






