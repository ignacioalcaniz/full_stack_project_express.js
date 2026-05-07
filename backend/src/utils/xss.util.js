// backend/src/utils/xss.util.js

const isTestLikeEnvironment =
  process.env.NODE_ENV === "test" ||
  process.env.CI === "true" ||
  process.env.ZAP_ENV === "true" ||
  Boolean(process.env.JEST_WORKER_ID);

let dompurifyPromise = null;

function basicStripHtml(value = "") {
  return String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

async function getDomPurify() {
  if (isTestLikeEnvironment) return null;

  if (!dompurifyPromise) {
    dompurifyPromise = Promise.all([
      import("jsdom"),
      import("isomorphic-dompurify"),
    ]).then(([jsdomModule, dompurifyModule]) => {
      const { JSDOM } = jsdomModule;
      const createDOMPurify = dompurifyModule.default || dompurifyModule;
      const window = new JSDOM("").window;
      return createDOMPurify(window);
    });
  }

  return dompurifyPromise;
}

async function sanitizeValue(v) {
  if (typeof v !== "string") return v;

  if (isTestLikeEnvironment) {
    return basicStripHtml(v);
  }

  const dompurify = await getDomPurify();

  if (!dompurify) {
    return basicStripHtml(v);
  }

  return dompurify.sanitize(v, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

async function deepSanitize(obj) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(deepSanitize));
  }

  if (obj && typeof obj === "object") {
    const clean = {};

    for (const k of Object.keys(obj)) {
      clean[k] = await deepSanitize(obj[k]);
    }

    return clean;
  }

  return sanitizeValue(obj);
}

export function xss() {
  return async (req, _res, next) => {
    try {
      if (req.body) req.body = await deepSanitize(req.body);
      if (req.query) req.query = await deepSanitize(req.query);
      if (req.params) req.params = await deepSanitize(req.params);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}


