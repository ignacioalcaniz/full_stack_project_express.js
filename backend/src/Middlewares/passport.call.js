import passport from "passport";

export const passportCall = (strategy, options = {}) => {
  return (req, res, next) => {
    passport.authenticate(strategy, options, (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        return res.status(401).send({
          status: "error",
          error: info?.messages || info?.toString(),
        });
      }

      req.user = user; // Documento completo de usuario
      next();
    })(req, res, next);
  };
};



