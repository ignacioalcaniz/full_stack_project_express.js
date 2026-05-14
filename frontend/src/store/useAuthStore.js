import { create } from "zustand";
import axios from "axios";
import axiosClient from "../api/axiosClient";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://api.thelibrarystore.it.com";

const plainClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const DEVICE_ID_KEY = "deviceId";

const getOrCreateDeviceId = () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = `dev_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 11)}`;
      }

      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch {
    return `dev_fallback_${Date.now()}`;
  }
};

const extractErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details?.[0] ||
    error?.message ||
    fallback
  );
};

const fetchProfileWithToken = async (token) => {
  const res = await plainClient.get("/users/profile", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data?.data;
};

const refreshSession = async () => {
  const res = await plainClient.post("/users/refresh", {});
  return res.data?.data?.accessToken || res.data?.accessToken || null;
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  authChecked: false,
  error: null,
  twoFARequired: false,

  emailOtpRequired: false,
  pendingLoginToken: "",
  pendingLoginEmail: "",

  login: async ({
    email,
    password,
    twoFAToken,
    otpCode,
    pendingLoginToken,
  }) => {
    const isOtpFlow = Boolean(pendingLoginToken && otpCode);

    try {
      set({ loading: true, error: null });

      const deviceId = getOrCreateDeviceId();
      let res;

      if (isOtpFlow) {
        res = await axiosClient.post("/users/login/verify-email-otp", {
          pendingToken: pendingLoginToken,
          code: otpCode,
          deviceId,
        });
      } else {
        const body = {
          email,
          password,
          deviceId,
          ...(twoFAToken && { twoFAToken }),
        };

        res = await axiosClient.post("/users/login", body);
      }

      if (res.status === 206 || res.data?.emailOtpRequired) {
        const token =
          res.data?.data?.pendingToken || res.data?.pendingToken || "";

        set({
          loading: false,
          error: null,
          emailOtpRequired: true,
          pendingLoginToken: token,
          pendingLoginEmail: email || "",
          twoFARequired: false,
          authChecked: true,
        });

        return {
          success: false,
          emailOtpRequired: true,
          pendingLoginToken: token,
        };
      }

      if (res.data?.twoFARequired) {
        set({
          twoFARequired: true,
          loading: false,
          error: null,
          authChecked: true,
        });

        return { success: false, twoFARequired: true };
      }

      const accessToken = res.data?.data?.accessToken;
      if (!accessToken) {
        throw new Error("No se recibió accessToken del servidor.");
      }

      localStorage.setItem("accessToken", accessToken);

      const userData = await fetchProfileWithToken(accessToken);

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
        error: null,
        twoFARequired: false,
        emailOtpRequired: false,
        pendingLoginToken: "",
        pendingLoginEmail: "",
      });

      return { success: true, user: userData };
    } catch (error) {
      const fallback = isOtpFlow
        ? "El código ingresado es incorrecto o expiró."
        : "Error al iniciar sesión";

      const msg = extractErrorMessage(error, fallback);

      set((state) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        authChecked: true,
        error: msg,
        emailOtpRequired: isOtpFlow ? true : state.emailOtpRequired,
        pendingLoginToken: state.pendingLoginToken,
        pendingLoginEmail: state.pendingLoginEmail,
      }));

      return { success: false, error: msg };
    }
  },

  clearPendingLoginOtp: () => {
    set({
      emailOtpRequired: false,
      pendingLoginToken: "",
      pendingLoginEmail: "",
      error: null,
    });
  },

  clearAuthError: () => {
    set({ error: null });
  },

  logout: async () => {
    try {
      await plainClient.post("/users/logout", {});
    } catch (e) {
      console.warn("Error en logout, pero se ignora:", e.message);
    } finally {
      localStorage.removeItem("accessToken");

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        authChecked: true,
        error: null,
        twoFARequired: false,
        emailOtpRequired: false,
        pendingLoginToken: "",
        pendingLoginEmail: "",
      });
    }
  },

  checkAuth: async () => {
    set({ loading: true, error: null });

    const storedToken = localStorage.getItem("accessToken");

    // ✅ si no hay token, no intentamos refresh al boot
    if (!storedToken) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        authChecked: true,
        error: null,
      });

      return { success: false, guest: true };
    }

    try {
      // 1) intento perfil con token guardado
      try {
        const userData = await fetchProfileWithToken(storedToken);

        set({
          user: userData,
          isAuthenticated: true,
          loading: false,
          authChecked: true,
          error: null,
        });

        return { success: true, user: userData };
      } catch (profileError) {
        const status = profileError?.response?.status;
        if (status !== 401) {
          throw profileError;
        }
      }

      // 2) si dio 401, recién ahí refrescamos
      const newAccessToken = await refreshSession();

      if (!newAccessToken) {
        throw new Error("No se recibió accessToken en refresh.");
      }

      localStorage.setItem("accessToken", newAccessToken);

      const userData = await fetchProfileWithToken(newAccessToken);

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      localStorage.removeItem("accessToken");

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        authChecked: true,
        error: null,
        twoFARequired: false,
        emailOtpRequired: false,
        pendingLoginToken: "",
        pendingLoginEmail: "",
      });

      return { success: false, error };
    }
  },

  updateProfile: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.patch("/users/profile", payload);
      const userData = res.data?.data;

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        "No se pudo actualizar el perfil"
      );

      set({
        loading: false,
        error: msg,
      });

      return { success: false, error: msg };
    }
  },

  updateSecurityPreferences: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.patch("/users/profile/security", payload);
      const userData = res.data?.data;

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        "No se pudieron actualizar las preferencias de seguridad"
      );

      set({
        loading: false,
        error: msg,
      });

      return { success: false, error: msg };
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.patch("/users/profile/password", {
        currentPassword,
        newPassword,
      });

      set({
        loading: false,
        error: null,
      });

      return { success: true, data: res.data?.data };
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        "No se pudo cambiar la contraseña"
      );

      set({
        loading: false,
        error: msg,
      });

      return { success: false, error: msg };
    }
  },

  fetchMyOrders: async () => {
    try {
      const res = await axiosClient.get("/users/me/orders");
      const payload = res?.data?.data ?? {};
      const orders = Array.isArray(payload.orders) ? payload.orders : [];
      return { success: true, orders };
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        "No pudimos cargar tus compras."
      );

      return { success: false, error: msg, orders: [] };
    }
  },

  setup2FA: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.post("/users/2fa/setup");
      const data = res.data?.data ?? res.data;

      set({ loading: false, error: null });

      return {
        success: true,
        qr: data?.qr || "",
        message: data?.message || "2FA generado correctamente.",
      };
    } catch (error) {
      const msg = extractErrorMessage(error, "No se pudo generar 2FA");

      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  verify2FA: async (code) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.post("/users/2fa/verify", { code });

      const token = localStorage.getItem("accessToken");
      const userData = await fetchProfileWithToken(token);

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
        error: null,
      });

      return {
        success: true,
        message: res.data?.message || "2FA activado correctamente.",
      };
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        "No se pudo verificar el código 2FA"
      );

      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },
}));



