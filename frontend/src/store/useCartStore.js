import { create } from "zustand";
import axiosClient from "../api/axiosClient";

const getCartCount = (cart) =>
  cart?.products?.reduce((acc, item) => acc + Number(item?.quantity || 1), 0) || 0;

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  initialized: false,

  fetchCart: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.get("/carts/me");
      const nextCart = res.data?.data ?? null;

      set({
        cart: nextCart,
        loading: false,
        error: null,
        initialized: true,
      });

      return nextCart;
    } catch (error) {
      set({
        error: "Error al cargar carrito",
        loading: false,
        initialized: true,
      });
      return null;
    }
  },

  addProduct: async (productId) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.post(`/carts/products/${productId}`);
      const nextCart = res.data?.data ?? null;

      set({
        cart: nextCart,
        loading: false,
        error: null,
        initialized: true,
      });

      return nextCart;
    } catch (error) {
      set({ error: "Error al agregar producto", loading: false });
      throw error;
    }
  },

  updateQuantity: async (cartId, prodId, quantity) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.put(`/carts/${cartId}/products/${prodId}`, {
        quantity,
      });

      const nextCart = res.data?.data ?? null;

      set({
        cart: nextCart,
        loading: false,
        error: null,
        initialized: true,
      });

      return nextCart;
    } catch (error) {
      set({ error: "Error al modificar cantidad", loading: false });
      throw error;
    }
  },

  removeProduct: async (cartId, prodId) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.delete(`/carts/${cartId}/products/${prodId}`);
      const nextCart = res.data?.data;

      if (nextCart?.products) {
        set({
          cart: nextCart,
          loading: false,
          error: null,
          initialized: true,
        });
        return nextCart;
      }

      const fetched = await get().fetchCart();
      set({ loading: false });
      return fetched;
    } catch (error) {
      set({ error: "Error al eliminar producto", loading: false });
      throw error;
    }
  },

  clearCart: async (cartId) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.delete(`/carts/clear/${cartId}`);
      const nextCart = res.data?.data;

      if (nextCart?.products) {
        set({
          cart: nextCart,
          loading: false,
          error: null,
          initialized: true,
        });
        return nextCart;
      }

      const fetched = await get().fetchCart();
      set({ loading: false });
      return fetched;
    } catch (error) {
      set({ error: "Error al vaciar carrito", loading: false });
      throw error;
    }
  },

  generateTicket: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.post("/carts/checkout");

      set({
        cart: { products: [] },
        loading: false,
        error: null,
        initialized: true,
      });

      return res.data?.data;
    } catch (error) {
      set({ error: "Error al generar ticket", loading: false });
      throw error;
    }
  },

  resetCart: () => {
    set({
      cart: null,
      loading: false,
      error: null,
      initialized: false,
    });
  },

  cartCount: () => getCartCount(get().cart),
}));





