import { productServices } from "../services/products.services.js";
import { createResponse } from "../utils/user.utils.js";




class ProductController {
  constructor(services) {
    this.services = services;
  }
   getAll = async (req, res, next) => {
    try {
      const data = await this.services.getAll();
      createResponse(res, 200, data);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
     try {
    const { id } = req.params;
    const product = await this.services.getById(id);
    res.json(product);
  } catch (error) {
    next(error);
  }
  };

  create = async (req, res, next) => {
   try {
    const newProduct = await this.services.create(req.body);
    res.json(newProduct);
  } catch (error) {
    next(error);
  }
  };

  update = async (req, res, next) => {
    try {
    const { id } = req.params;
    const productUpdated = await this.services.update(id, req.body);
    res.json(productUpdated);
  } catch (error) {
    next(error);
  }
  };

  delete = async (req, res, next) => {
     try {
    const { id } = req.params;
    const prodDel = await this.services.remove(id);
    res.json(prodDel);
  } catch (error) {
    next(error);
  }
  };
}

export const productController = new ProductController(productServices);
