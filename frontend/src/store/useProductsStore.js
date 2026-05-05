// src/store/useProductsStore.js
import { create } from "zustand";
import axiosClient from "../api/axiosClient";

/* ======================
   API helpers
====================== */
const getAllProducts = async () => {
  const res = await axiosClient.get("/products");
  return res.data;
};

const getProductById = async (id) => {
  const res = await axiosClient.get(`/products/${id}`);
  return res.data;
};

const getFeaturedProducts = async () => {
  const res = await axiosClient.get("/products/featured");
  return res.data;
};

const getPopularProducts = async () => {
  const res = await axiosClient.get("/products/popular");
  return res.data;
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;

  const wrapper = data?.data ?? data?.payload ?? data;

  if (Array.isArray(wrapper?.docs)) return wrapper.docs;
  if (Array.isArray(wrapper)) return wrapper;

  return [];
};

const normalizeOne = (data) => {
  if (data?.data && !Array.isArray(data.data)) return data.data;
  return data;
};

export const useProductsStore = create((set) => ({
  // Catálogo general
  products: [],

  // Home / secciones
  featuredProducts: [],
  popularProducts: [],

  // Detalle
  product: null,

  loading: false,
  error: null,

  /* ======================
     📦 CATÁLOGO
  ====================== */
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAllProducts();
      const products = normalizeList(data);
      set({ products, loading: false });
    } catch (err) {
      console.error("Error fetching products", err);
      set({ error: "Error al cargar productos", loading: false });
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ loading: true, error: null, product: null });
      const data = await getProductById(id);
      const product = normalizeOne(data);
      set({ product, loading: false });
    } catch (err) {
      console.error("Error fetching product", err);
      set({ error: "Error al cargar el producto", loading: false });
    }
  },

  clearProduct: () => set({ product: null }),

  /* ======================
     🔥 HOME
  ====================== */
  fetchFeaturedProducts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getFeaturedProducts();
      const featuredProducts = normalizeList(data);
      set({ featuredProducts, loading: false });
    } catch (err) {
      console.error("Error fetching featured products", err);
      set({ error: "Error al cargar destacados", loading: false });
    }
  },

  fetchPopularProducts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getPopularProducts();
      const popularProducts = normalizeList(data);
      set({ popularProducts, loading: false });
    } catch (err) {
      console.error("Error fetching popular products", err);
      set({ error: "Error al cargar populares", loading: false });
    }
  },

  fetchProductsQuery: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get("/products", { params });
      const data = res.data;

      const payload = data?.data || data?.payload || data;
      const docs = payload?.docs || payload;

      const products = Array.isArray(docs) ? docs : [];
      set({ products, loading: false });
    } catch (err) {
      console.error("Error fetching products query", err);
      set({ error: "Error al cargar productos", loading: false });
    }
  },
}));













