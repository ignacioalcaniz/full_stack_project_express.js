// src/Middlewares/captcha.middleware.js
// Valida hCaptcha (HCAPTCHA_SECRET) o reCAPTCHA (RECAPTCHA_SECRET).
// Node 20 ya trae fetch global (no hace falta node-fetch).

export async function verifyCaptcha(req, res, next) {
  try {
    const token =
      req.body["h-captcha-response"] ||
      req.body["g-recaptcha-response"] ||
      req.headers["x-captcha-token"] ||
      req.body.captchaToken;

    if (!token) {
      return res.status(400).json({ error: "Captcha no verificado" });
    }

    const isHCaptcha = !!process.env.HCAPTCHA_SECRET;
    const secret = process.env.HCAPTCHA_SECRET || process.env.RECAPTCHA_SECRET;

    if (!secret) {
      return res.status(500).json({ error: "Captcha no configurado en el servidor" });
    }

    const url = isHCaptcha
      ? "https://hcaptcha.com/siteverify"
      : "https://www.google.com/recaptcha/api/siteverify";

    const body = new URLSearchParams({ secret, response: token });
    const resp = await fetch(url, { method: "POST", body });
    const data = await resp.json();

    if (!data.success) {
      return res.status(403).json({ error: "Captcha inválido" });
    }

    next();
  } catch (e) {
    console.error("Captcha verify error:", e);
    return res.status(500).json({ error: "Error verificando captcha" });
  }
}

