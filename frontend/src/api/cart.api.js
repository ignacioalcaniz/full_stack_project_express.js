import axiosClient from "./axiosClient";

export const getCartById = async (cartId) => {
  const { data } = await axiosClient.get(`/carts/${cartId}`);
  return data;
};

export const addProductToCart = async (prodId) => {
  const { data } = await axiosClient.post(`/carts/products/${prodId}`);
  return data;
};

export const updateQuantity = async (cartId, prodId, quantity) => {
  const { data } = await axiosClient.put(`/carts/${cartId}/products/${prodId}`, {
    quantity,
  });
  return data;
};

export const removeProduct = async (cartId, prodId) => {
  const { data } = await axiosClient.delete(
    `/carts/${cartId}/products/${prodId}`
  );
  return data;
};

export const clearCart = async (cartId) => {
  const { data } = await axiosClient.delete(`/carts/clear/${cartId}`);
  return data;
};
