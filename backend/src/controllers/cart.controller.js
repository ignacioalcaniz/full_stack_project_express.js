import { cartServices } from "../services/carrito.services.js";
import { createResponse } from "../utils/user.utils.js";

class CartController {
  constructor(services) {
    this.services = services;
  }

  addProdToCart = async (req, res, next) => {
    try {
      const { cart } = req.user;
      const { idProd } = req.params;
      const newProdToUserCart = await this.services.addProdToCart(cart, idProd);

      req.logger.info(`Producto ${idProd} agregado al carrito ${cart}`);
      createResponse(res, 200, newProdToUserCart);
    } catch (error) {
      req.logger.error(`Error al agregar producto al carrito: ${error.message}`);
      next(error);
    }
  };

  removeProdToCart = async (req, res, next) => {
    try {
      const { idCart, idProd } = req.params;
      const delProdToUserCart = await this.services.removeProdToCart(idCart, idProd);

      req.logger.info(`Producto ${idProd} eliminado del carrito ${idCart}`);
      createResponse(res, 200, {
        msg: `Producto ${delProdToUserCart._id} eliminado del carrito`,
      });
    } catch (error) {
      req.logger.error(`Error al eliminar producto del carrito: ${error.message}`);
      next(error);
    }
  };

  updateProdQuantityToCart = async (req, res, next) => {
    try {
      const { idCart, idProd } = req.params;
      const { quantity } = req.body;
      const updateProdQuantity = await this.services.updateProdQuantityToCart(idCart, idProd, quantity);

      req.logger.info(`Cantidad del producto ${idProd} en carrito ${idCart} actualizada a ${quantity}`);
      createResponse(res, 200, updateProdQuantity);
    } catch (error) {
      req.logger.error(`Error al actualizar cantidad: ${error.message}`);
      next(error);
    }
  };

  clearCart = async (req, res, next) => {
    try {
      const { idCart } = req.params;
      const cleared = await this.services.clearCart(idCart);

      req.logger.warn(`Carrito ${idCart} fue vaciado`);
      createResponse(res, 200, cleared);
    } catch (error) {
      req.logger.error(`Error al vaciar carrito: ${error.message}`);
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const response = await this.services.getAll();

      req.logger.info(`Consulta de todos los carritos`);
      res.json(response);
    } catch (error) {
      req.logger.error(`Error al obtener carritos: ${error.message}`);
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const cart = await this.services.getById(id);

      if (!cart) {
        req.logger.warn(`Carrito ${id} no encontrado`);
        return res.status(404).json({ error: "Carrito no encontrado" });
      }

      req.logger.info(`Carrito ${id} obtenido`);
      res.json(cart);
    } catch (error) {
      req.logger.error(`Error al obtener carrito: ${error.message}`);
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newCart = await this.services.create(req.body);

      if (!newCart) {
        req.logger.warn("Intento de crear carrito inválido");
        return res.status(400).json({ error: "Error de validación" });
      }

      req.logger.info(`Carrito creado con ID ${newCart._id}`);
      res.json(newCart);
    } catch (error) {
      req.logger.error(`Error al crear carrito: ${error.message}`);
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.services.update(id, req.body);

      req.logger.info(`Carrito ${id} actualizado`);
      createResponse(res, 200, data);
    } catch (error) {
      req.logger.error(`Error al actualizar carrito: ${error.message}`);
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.services.delete(id);

      req.logger.warn(`Carrito ${id} eliminado`);
      createResponse(res, 200, data);
    } catch (error) {
      req.logger.error(`Error al eliminar carrito: ${error.message}`);
      next(error);
    }
  };
}

export const cartController = new CartController(cartServices);



