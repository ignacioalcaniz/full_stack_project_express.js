// src/Middlewares/passport.call.js
import passport from "passport";

export const passportCall = (strategy, options = {}) => {
  return (req, res, next) => {
    passport.authenticate(strategy, options, (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        return res.status(401).send({
          status: "error",
          error: info?.message || info?.messages || info?.toString() || "No autorizado",
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};




