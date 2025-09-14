import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { userServices } from "../../services/user.services.js";  


const cookieExtractor = (req) => {
  return req.cookies.token; 
};


const strategyCookiesConfig = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.SECRET_KEY_JWT,
};


const verifyToken = async (jwt_payload, done) => {
  try {
    if (!jwt_payload)
      return done(null, false, { messages: "Usuario inexistente" });

    const user = await userServices.getById(jwt_payload.id); 
    if (!user) return done(null, false, { messages: "Usuario no encontrado" });

    return done(null, user); 
  } catch (error) {
    return done(error, false);
  }
};

passport.use("jwt", new Strategy(strategyCookiesConfig, verifyToken));
