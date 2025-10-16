import { CartModel } from "../model/cart.model.js";
import MongoDao from "./mongo.dao.js";

export default class CartDaoMongo extends MongoDao {
  constructor(model) {
    super(model);
  }

  create = async () => {
    return await this.model.create({ products: [] });
  };

  getById = async (id) => {
    // 👉 importante: siempre populamos el product
    return await this.model.findById(id).populate("products.product");
  };

  addProdToCart = async (cartId, prodId) => {
    const cart = await this.model.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const existingProductIndex = cart.products.findIndex(
      (p) => p.product?.toString() === prodId.toString()
    );

    if (existingProductIndex !== -1) {
      // Si ya existe, incrementamos la cantidad
      cart.products[existingProductIndex].quantity += 1;
    } else {
      // Si no existe, lo agregamos correctamente
      cart.products.push({
        product: prodId,
        quantity: 1,
      });
    }

    await cart.save();
    // 👉 devolvemos populado
    return await cart.populate("products.product");
  };

  existProdInCart = async (cartId, prodId) => {
    return await this.model.findOne({
      _id: cartId,
      "products.product": prodId,
    });
  };

  removeProdToCart = async (cartId, prodId) => {
    const cart = await this.model.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== prodId.toString()
    );

    await cart.save();
    return await cart.populate("products.product");
  };

  updateProdQuantityToCart = async (cartId, prodId, quantity) => {
    const cart = await this.model.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = cart.products.find(
      (p) => p.product.toString() === prodId.toString()
    );
    if (!product) throw new Error("Producto no encontrado en el carrito");

    product.quantity = quantity;
    await cart.save();
    return await cart.populate("products.product");
  };

  clearCart = async (cartId) => {
    const cart = await this.model.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = [];
    await cart.save();
    return cart;
  };
}

export const CartDao = new CartDaoMongo(CartModel);

