import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { userServices } from "../../services/user.services.js";
import "dotenv/config";


const strategyConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const verifyToken = async (jwt_payload, done) => {
 
  if (!jwt_payload) return done(null, false, { messages: "Invalid Token" });
  return done(null, jwt_payload);
};

passport.use("jwt", new Strategy(strategyConfig, verifyToken));


passport.serializeUser((user, done) => {
  try {

    done(null, user._id);
  } catch (error) {
    done(error);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userServices.getById(id);
    return done(null, user);
  } catch (error) {
    done(error);
  }
});