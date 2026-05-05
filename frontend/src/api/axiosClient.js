import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://api.thelibrarystore.it.com";

const CSRF_STORAGE_KEY = "csrfToken";

const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// cliente sin interceptores
const plainClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;
let csrfPromise = null;
let csrfTokenCache = sessionStorage.getItem(CSRF_STORAGE_KEY) || "";

/* ======================
   HELPERS
====================== */

function shouldSkipRefresh(url = "") {
  return (
    url.includes("/users/login") ||
    url.includes("/users/login/verify-email-otp") ||
    url.includes("/users/refresh") ||
    url.includes("/users/register") ||
    url.includes("/users/forgot-password") ||
    url.includes("/users/reset-password")
  );
}

function shouldSkipCsrf(config = {}) {
  const method = String(config.method || "get").toLowerCase();
  const url = config.url || "";

  // métodos seguros
  if (["get", "head", "options"].includes(method)) return true;

  // ❌ NO incluir forgot/reset acá
  return (
    url.includes("/users/login") ||
    url.includes("/users/login/verify-email-otp") ||
    url.includes("/users/refresh") ||
    url.includes("/users/register") ||
    url.includes("/users/logout") ||
    url.includes("/payments/webhook")
  );
}

function setCsrfToken(token = "") {
  csrfTokenCache = token || "";

  if (csrfTokenCache) {
    sessionStorage.setItem(CSRF_STORAGE_KEY, csrfTokenCache);
  } else {
    sessionStorage.removeItem(CSRF_STORAGE_KEY);
  }
}

async function getCsrfToken(force = false) {
  if (!force && csrfTokenCache) return csrfTokenCache;
  if (csrfPromise) return csrfPromise;

  csrfPromise = plainClient
    .get("/csrf-token")
    .then((res) => {
      const token =
        res?.data?.data?.csrfToken ||
        res?.data?.csrfToken ||
        "";

      if (!token) {
        throw new Error("No se recibió csrfToken del servidor.");
      }

      setCsrfToken(token);
      return token;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

async function runRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = plainClient
    .post("/users/refresh", {})
    .then((res) => {
      const newToken = res.data?.data?.accessToken || res.data?.accessToken;
      if (!newToken) throw new Error("Refresh OK pero sin accessToken");

      localStorage.setItem("accessToken", newToken);
      return newToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/* ======================
   REQUEST INTERCEPTOR
====================== */

axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("accessToken");

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔐 CSRF para métodos protegidos
  if (!shouldSkipCsrf(config)) {
    const csrfToken = await getCsrfToken(false);

    config.headers["X-CSRF-Token"] = csrfToken;
    config.headers["X-Requested-With"] = "XMLHttpRequest";
  }

  return config;
});

/* ======================
   RESPONSE INTERCEPTOR
====================== */

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;
    const url = original?.url || "";

    const backendMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      "";

    if (!original) {
      return Promise.reject(error);
    }

    // 🔁 REFRESH TOKEN
    if (!shouldSkipRefresh(url) && status === 401 && !original._retry) {
      original._retry = true;

      try {
        const newToken = await runRefresh();

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;

        return axiosClient(original);
      } catch (err) {
        localStorage.removeItem("accessToken");
        return Promise.reject(err);
      }
    }

    // 🔐 CSRF retry
    if (
      status === 403 &&
      backendMessage.toLowerCase().includes("csrf") &&
      !original._csrfRetry &&
      !shouldSkipCsrf(original)
    ) {
      original._csrfRetry = true;

      try {
        const freshCsrf = await getCsrfToken(true);

        original.headers = original.headers || {};
        original.headers["X-CSRF-Token"] = freshCsrf;
        original.headers["X-Requested-With"] = "XMLHttpRequest";

        return axiosClient(original);
      } catch (err) {
        setCsrfToken("");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export { getCsrfToken, setCsrfToken };
export default axiosClient;












