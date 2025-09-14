
import { cartServices } from "../services/carrito.services.js";
import { createResponse } from "../utils/user.utils.js";





export default class CartController {
  constructor(services) {
    this.services = services;
  }
  addProdToCart = async (req, res, next) => {
    try {
       console.log("Usuario:", req.user);
      const { cart } = req.user;
      const { idProd } = req.params;
      const newProdToUserCart = await this.services.addProdToCart(
        cart,
        idProd
      );
      createResponse(res, 200, newProdToUserCart);
    } catch (error) {
      next(error);
    }
  };

  removeProdToCart = async (req, res, next) => {
    try {
      const { idCart } = req.params;
      const { idProd } = req.params;
      const delProdToUserCart = await this.services.removeProdToCart(
        idCart,
        idProd
      );
      createResponse(res, 200, {
        msg: `product ${delProdToUserCart._id} deleted to cart`,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProdQuantityToCart = async (req, res, next) => {
    try {
      const { idCart } = req.params;
      const { idProd } = req.params;
      const { quantity } = req.body;
      const updateProdQuantity = await this.services.updateProdQuantityToCart(
        idCart,
        idProd,
        quantity
      );
      createResponse(res, 200, updateProdQuantity);
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req, res, next) => {
    try {
      const { idCart } = req.params;
      const clearCart = await this.services.clearCart(idCart);
      createResponse(res, 200, clearCart);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
   try {
    const response = await this.services.getAll();
    res.json(response);
  } catch (error) {
    next(error);
  }
  };

  getById = async (req, res, next) => {
     try {
    const { id } = req.params;
    const cart = await this.services.getById(id);
    if (!cart) throw new Error("cart not found!");
    res.json(cart);
  } catch (error) {
    next(error);
  }
  };

  create = async (req, res, next) => {
     try {
    const newCart = await this.services.create(req.body);
    if (newCart) throw new Error("Validation Error!");
    else res.json(newCart);
  } catch (error) {
    next(error);
  }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.services.update(id, req.body);
      createResponse(res, 200, data);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.services.delete(id);
      createResponse(res, 200, data);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController(cartServices)


