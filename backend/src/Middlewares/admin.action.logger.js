import { logAdminAction } from "../services/admin.logs.services.js";

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

function scrub(obj) {
  const blockedKeys = new Set([
    "password",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "cookie",
    "uid",
    "twoFASecret",
    "twoFAToken",
  ]);

  const seen = new WeakSet();

  const walk = (v) => {
    if (v === null || v === undefined) return v;
    if (typeof v !== "object") return v;
    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(walk);

    const out = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = blockedKeys.has(k) ? "[REDACTED]" : walk(val);
    }
    return out;
  };

  try {
    return walk(obj);
  } catch {
    return {};
  }
}

function buildAction(req) {
  const base = req.baseUrl || "";
  const path = req.path || "";
  const full = `${base}${path}`;

  if (full.startsWith("/admin/settings")) return "settings:update";
  if (full.startsWith("/admin/chatbot")) return "chatbot:manage";

  if (full.startsWith("/admin/products")) {
    if (req.method === "POST") return "products:create";
    if (req.method === "PUT" || req.method === "PATCH") return "products:update";
    if (req.method === "DELETE") return "products:delete";
    return "products:read";
  }

  if (full.startsWith("/admin/users")) {
    if (req.method === "PUT" || req.method === "PATCH") return "users:update";
    if (req.method === "DELETE") return "users:delete";
    return "users:read";
  }

  if (full.startsWith("/admin/tickets")) return "tickets:read";
  if (full.startsWith("/admin/dashboard")) return "dashboard:read";

  const mod = full.split("/").filter(Boolean)[1] || "admin";
  return `${mod}:${req.method.toLowerCase()}`;
}

export function adminActionLogger(req, res, next) {
  const started = Date.now();

  const full = `${req.baseUrl || ""}${req.path || ""}`;
  const skip = full.startsWith("/admin/logs");

  res.on("finish", async () => {
    if (skip) return;

    try {
      const durationMs = Date.now() - started;
      const adminId = req.user?._id || req.user?.id || null;

      await logAdminAction({
        adminId,
        action: buildAction(req),
        method: req.method,
        route: full,
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
        statusCode: res.statusCode,
        durationMs,
        details: scrub({
          params: req.params,
          query: req.query,
          body: req.body,
        }),
      });
    } catch {
      // nunca se rompe la request por el log
    }
  });

  next();
}