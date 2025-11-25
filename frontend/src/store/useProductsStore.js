import { create } from "zustand";
import axios from "../api/axiosClient";

export const useProductsStore = create((set) => ({
  products: [],
  product: null,
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/products");
      set({ products: res.data.payload, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.get(`/products/${id}`);
      set({ product: res.data.payload, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addToCart: (product) => {
    console.log("Producto añadido:", product.nombre);
    // pronto conectamos con backend /carts
  }
}));


