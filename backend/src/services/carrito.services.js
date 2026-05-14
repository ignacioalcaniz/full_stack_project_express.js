// src/services/carrito.services.js
import { CartDao } from "../daos/cart.dao.js";
import { CustomError } from "../utils/error.custom.js";
import { productServices } from "./products.services.js";

class CartServices {
  constructor(dao) {
    this.dao = dao;
  }

  create = async () => {
    return await this.dao.create();
  };

  getAll = async () => {
    return await this.dao.getAll();
  };

  getById = async (id) => {
    const cart = await this.dao.getById(id);
    if (!cart) throw new CustomError("Carrito no encontrado", 404);
    return cart;
  };

  // ✅ devuelve carrito del usuario (por id cart)
  getByUserCartId = async (cartId) => {
    if (!cartId) throw new CustomError("El usuario no tiene carrito asignado", 404);
    return await this.getById(cartId);
  };

  addProdToCart = async (cartId, prodId) => {
    const product = await productServices.getById(prodId);
    if (!product) throw new CustomError("Producto no encontrado", 404);

    const updatedCart = await this.dao.addProdToCart(cartId, product._id);
    return updatedCart;
  };

  removeProdToCart = async (cartId, prodId) => {
    const updated = await this.dao.removeProdToCart(cartId, prodId);
    return updated;
  };

  updateProdQuantityToCart = async (cartId, prodId, quantity) => {
    const q = Number(quantity);

    if (!Number.isFinite(q)) throw new CustomError("Cantidad inválida", 400);

    // regla pro: si baja a 0 o menos, lo eliminamos
    if (q <= 0) {
      const updated = await this.dao.removeProdToCart(cartId, prodId);
      return updated;
    }

    const updated = await this.dao.updateProdQuantityToCart(cartId, prodId, q);
    return updated;
  };

  clearCart = async (cartId) => {
    const cleared = await this.dao.clearCart(cartId);
    return cleared;
  };

  update = async (id, data) => {
    return await this.dao.update(id, data);
  };

  delete = async (id) => {
    return await this.dao.delete(id);
  };
}

export const cartServices = new CartServices(CartDao);



    