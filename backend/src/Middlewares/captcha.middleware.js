export async function verifyCaptcha(req, res, next) {
  try {
    const shouldBypassCaptcha =
      process.env.NODE_ENV === "test" ||
      process.env.CI === "true" ||
      process.env.ZAP_ENV === "true" ||
      process.env.DISABLE_CAPTCHA === "true";

    if (shouldBypassCaptcha) {
      return next();
    }

    const token =
      req.body["h-captcha-response"] ||
      req.body["g-recaptcha-response"] ||
      req.headers["x-captcha-token"] ||
      req.headers["X-Captcha-Token"] ||
      req.body.captchaToken;

    if (!token) {
      return res.status(400).json({ error: "Captcha no verificado" });
    }

    const isHCaptcha = Boolean(process.env.HCAPTCHA_SECRET);
    const secret = process.env.HCAPTCHA_SECRET || process.env.RECAPTCHA_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ error: "Captcha no configurado en el servidor" });
    }

    const url = isHCaptcha
      ? "https://hcaptcha.com/siteverify"
      : "https://www.google.com/recaptcha/api/siteverify";

    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: req.ip,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await resp.json();

    if (!data.success) {
      console.log("❌ Captcha inválido:", data);
      return res.status(403).json({
        error: "Captcha inválido",
        details: data["error-codes"] || null,
      });
    }

    return next();
  } catch (e) {
    console.error("Captcha verify error:", e);
    return res.status(500).json({ error: "Error verificando captcha" });
  }
}

