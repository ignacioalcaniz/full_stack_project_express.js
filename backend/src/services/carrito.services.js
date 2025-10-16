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

  getById = async (id) => {
    const cart = await this.dao.getById(id);
    if (!cart) throw new CustomError("Carrito no encontrado", 404);
    return cart;
  };

  addProdToCart = async (cartId, prodId) => {
    const product = await productServices.getById(prodId);
    if (!product) throw new CustomError("Producto no encontrado", 404);

    const updatedCart = await this.dao.addProdToCart(cartId, product._id);
    return updatedCart;
  };

  clearCart = async (cartId) => {
    const cleared = await this.dao.clearCart(cartId);
    return cleared;
  };
}

export const cartServices = new CartServices(CartDao);


    