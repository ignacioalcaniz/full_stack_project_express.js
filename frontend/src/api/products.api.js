import axiosClient from "./axiosClient";

export const getAllProducts = async () => {
  const res = await axiosClient.get("/products");
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axiosClient.get(`/products/${id}`);
  return res.data;
};