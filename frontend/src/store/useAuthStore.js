import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { data } = await axiosClient.post("/users/login", credentials);

    localStorage.setItem("accessToken", data.token);

    set({
      user: data.user,
      isAuthenticated: true
    });
  },

  logout: async () => {
    await axiosClient.post("/users/logout");
    localStorage.removeItem("accessToken");

    set({
      user: null,
      isAuthenticated: false
    });
  }
}));
