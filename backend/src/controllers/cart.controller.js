// src/controllers/cart.controller.js
import { cartServices } from "../services/carrito.services.js";
import { createResponse } from "../utils/user.utils.js";
import { ProductModel } from "../model/product.model.js";
import { ticketController } from "./ticket.controller.js";

class CartController {
  constructor(services) {
    this.services = services;
  }

  addProdToCart = async (req, res, next) => {
    try {
      const { cart } = req.user;
      const { idProd } = req.params;

      const updatedCart = await this.services.addProdToCart(cart, idProd);

      // stats
      await ProductModel.findByIdAndUpdate(idProd, {
        $inc: { "stats.cart": 1 },
      });

      req.logger.info(`Producto ${idProd} agregado al carrito ${cart}`);
      createResponse(res, 200, updatedCart);
    } catch (error) {
      next(error);
    }
  };

  // 🔥 FIX DEFINITIVO
  removeProdToCart = async (req, res, next) => {
    try {
      const { idCart, idProd } = req.params;

      const updatedCart = await this.services.removeProdToCart(idCart, idProd);

      req.logger.info(`Producto ${idProd} eliminado del carrito ${idCart}`);
      createResponse(res, 200, updatedCart); // ✅ DEVOLVER CARRITO
    } catch (error) {
      next(error);
    }
  };

  updateProdQuantityToCart = async (req, res, next) => {
    try {
      const { idCart, idProd } = req.params;
      const { quantity } = req.body;

      const updatedCart =
        await this.services.updateProdQuantityToCart(
          idCart,
          idProd,
          quantity
        );

      createResponse(res, 200, updatedCart);
    } catch (error) {
      next(error);
    }
  };

  // 🔥 FIX DEFINITIVO
  clearCart = async (req, res, next) => {
    try {
      const { idCart } = req.params;

      const updatedCart = await this.services.clearCart(idCart);

      req.logger.warn(`Carrito ${idCart} vaciado`);
      createResponse(res, 200, updatedCart); // ✅ DEVOLVER CARRITO
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
      createResponse(res, 200, cart);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newCart = await this.services.create();
      createResponse(res, 201, newCart);
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

  // /carts/me
  getMyCart = async (req, res, next) => {
    try {
      const cartId = req.user?.cart;
      const cart = await this.services.getByUserCartId(cartId);
      createResponse(res, 200, cart);
    } catch (error) {
      next(error);
    }
  };

  // /carts/checkout
  checkout = async (req, res, next) => {
    return ticketController.generateTicket(req, res, next);
  };
}

export const cartController = new CartController(cartServices);




