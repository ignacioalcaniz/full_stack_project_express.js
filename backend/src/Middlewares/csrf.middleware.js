import csurf from "csurf";

const CSRF_EXEMPT_PATHS = new Set([
  "/users/login",
  "/users/register",
  "/users/login/verify-email-otp",
  "/users/refresh",
  "/users/logout",
  "/payments/webhook",
]);

const normalizePath = (path = "") => {
  const clean = path.split("?")[0].replace(/\/+$/, "");
  return clean || "/";
};

const cookieOptions = {
  key: "_csrf",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const rawCsrfProtection = csurf({
  cookie: cookieOptions,
});

export const csrfProtection = (req, res, next) => {
  const path = normalizePath(req.path);

  if (CSRF_EXEMPT_PATHS.has(path)) {
    return next();
  }

  return rawCsrfProtection(req, res, next);
};

export const csrfTokenController = (req, res) => {
  const token = req.csrfToken();

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    data: {
      csrfToken: token,
    },
  });
};

export const csrfErrorHandler = (err, _req, res, next) => {
  if (err?.code !== "EBADCSRFTOKEN") {
    return next(err);
  }

  return res.status(403).json({
    error: "invalid csrf token",
  });
};