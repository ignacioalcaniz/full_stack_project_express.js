import { productServices } from "../services/products.services.js";
import { createResponse } from "../utils/user.utils.js";

class ProductController {
  constructor(services) {
    this.services = services;
  }

  getAll = async (req, res, next) => {
    try {
      const data = await this.services.getAll();
      req.logger.info("Productos obtenidos correctamente");
      createResponse(res, 200, data);
    } catch (error) {
      req.logger.error("Error al obtener productos: " + error.message);
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.services.getById(id);
      if (!product) {
        req.logger.warn(`Producto con ID ${id} no encontrado`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      req.logger.info(`Producto con ID ${id} obtenido`);
      res.json(product);
    } catch (error) {
      req.logger.error("Error al obtener producto: " + error.message);
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newProduct = await this.services.create(req.body);
      req.logger.info(`Producto creado: ${newProduct._id}`);
      res.status(201).json(newProduct);
    } catch (error) {
      req.logger.error("Error al crear producto: " + error.message);
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const productUpdated = await this.services.update(id, req.body);
      if (!productUpdated) {
        req.logger.warn(`Intento de actualizar producto inexistente ID ${id}`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      req.logger.info(`Producto actualizado: ${id}`);
      res.json(productUpdated);
    } catch (error) {
      req.logger.error("Error al actualizar producto: " + error.message);
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const prodDel = await this.services.remove(id);
      if (!prodDel) {
        req.logger.warn(`Intento de eliminar producto inexistente ID ${id}`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      req.logger.info(`Producto eliminado: ${id}`);
      res.json(prodDel);
    } catch (error) {
      req.logger.error("Error al eliminar producto: " + error.message);
      next(error);
    }
  };
}

export const productController = new ProductController(productServices);

