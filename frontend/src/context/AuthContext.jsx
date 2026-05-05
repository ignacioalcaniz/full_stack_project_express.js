import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAuthStore } from "../store/useAuthStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const authChecked = useAuthStore((s) => s.authChecked);
  const loginStore = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);
  const checkAuthStore = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuthStore();
  }, [checkAuthStore]);

  const login = useCallback(
    async (email, password) => {
      const res = await loginStore({ email, password });
      if (!res?.success) throw new Error(res?.error || "Login failed");
      return res.user;
    },
    [loginStore]
  );

  const logout = useCallback(async () => {
    await logoutStore();
  }, [logoutStore]);

  const value = useMemo(
    () => ({
      user,
      loading: !authChecked,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, authChecked, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);



