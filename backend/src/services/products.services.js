import { productDaoMongo } from "../daos/product.dao.js";
import { CustomError } from "../utils/error.custom.js";


class ProductServices {
  constructor(dao) {
    this.dao = dao;
  }

  getAll = async () => {
    try {
      return await this.dao.getAll();
    } catch (error) {
      throw new Error(error);
    }
  };

  getById = async (id) => {
    try {
      const response = await this.dao.getById(id);
      if (!response) throw new CustomError("Producto no encontrado", 404);
      return response;
    } catch (error) {
      throw error;
    }
  };

  create = async (body) => {
    try {
      const response = await this.dao.create(body);
      if (!response) throw new CustomError("Error al crear el producto", 404);
      return response;
    } catch (error) {
      throw error;
    }
  };

  update = async (id, body) => {
    try {
      const response = await this.dao.update(id, body);
      if (!response)
        throw new CustomError("Error al actualizar el producto", 404);
      return response;
    } catch (error) {
      throw error;
    }
  };

  delete = async (id) => {
    try {
      const response = await this.dao.delete(id);
      if (!response)
        throw new CustomError("Error al eliminar el producto", 404);
      return response;
    } catch (error) {
      throw error;
    }
  };
}

export const productServices = new ProductServices(productDaoMongo);