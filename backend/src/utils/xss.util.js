// backend/src/utils/xss.util.js
import { JSDOM } from "jsdom";
import createDOMPurify from "isomorphic-dompurify";

// Solo inicializamos dompurify fuera de test
let dompurify = null;

if (process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
  const window = new JSDOM("").window;
  dompurify = createDOMPurify(window);
}

// Limpia strings; mantiene números/boolean/objetos sin tocar estructura
function sanitizeValue(v) {
  if (typeof v === "string" && dompurify) {
    return dompurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  return v;
}

function deepSanitize(obj) {
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const k of Object.keys(obj)) clean[k] = deepSanitize(obj[k]);
    return clean;
  }
  return sanitizeValue(obj);
}

// Middleware que sanitiza body, query y params
export function xss() {
  return (req, _res, next) => {
    if (req.body) req.body = deepSanitize(req.body);
    if (req.query) req.query = deepSanitize(req.query);
    if (req.params) req.params = deepSanitize(req.params);
    next();
  };
}


