// src/store/useProductsStore.js
import { create } from "zustand";
import axiosClient from "../api/axiosClient";

// 👉 Helper: obtiene todos los productos del backend
const getAllProducts = async () => {
  const res = await axiosClient.get("/products");
  return res.data; // acá viene { data: [...] }
};

const getProductById = async (id) => {
  const res = await axiosClient.get(`/products/${id}`);
  return res.data; // probablemente { data: { ... } }
};

export const useProductsStore = create((set) => ({
  products: [],
  product: null,
  loading: false,
  error: null,

  // 🔹 Lista completa
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });

      const data = await getAllProducts();
      console.log("[useProductsStore] /products response =>", data);

      // Nuestro backend está devolviendo { data: [...] }
      const products = Array.isArray(data)
        ? data
        : data?.data || data?.payload || data?.docs || [];

      console.log("[useProductsStore] productos normalizados =>", products);

      set({ products, loading: false });
    } catch (err) {
      console.error("Error fetching products", err);
      set({ error: "Error al cargar productos", loading: false });
    }
  },

  // 🔹 Detalle por ID
  fetchProductById: async (id) => {
    try {
      set({ loading: true, error: null, product: null });

      const data = await getProductById(id);
      console.log("[useProductsStore] /products/" + id + " =>", data);

      const product =
        data?.data && !Array.isArray(data.data) ? data.data : data;

      set({ product, loading: false });
    } catch (err) {
      console.error("Error fetching product", err);
      set({ error: "Error al cargar el producto", loading: false });
    }
  },

  clearProduct: () => set({ product: null }),
}));









