import { productServices } from "../services/products.services.js";
import { createResponse } from "../utils/user.utils.js";

class ProductController {
  constructor(services) {
    this.services = services;
  }

  // ===============================
  // GET ALL (CATÁLOGO + FILTROS)
  // ===============================
  getAll = async (req, res, next) => {
    try {
      const {
        q,
        categoria,
        autor,
        pais,
        idioma,
        editorial,
        anio,
        ratingMin,
        stock,
        precioMin,
        precioMax,
        sort,
        limit,
        page,
      } = req.query;

      const filter = {};

      // 🔎 BÚSQUEDA PARCIAL (clave para UX)
      if (q?.trim()) {
        filter.nombre = { $regex: q.trim(), $options: "i" };
      }

      // 📚 Filtros de texto (regex = flexible)
      if (categoria && categoria !== "todas") {
        filter.categoria = categoria;
      }

      if (autor) {
        filter.autor = { $regex: autor, $options: "i" };
      }

      if (pais) {
        filter.pais = { $regex: pais, $options: "i" };
      }

      if (idioma) {
        filter.idioma = idioma;
      }

      if (editorial) {
        filter.editorial = { $regex: editorial, $options: "i" };
      }

      // 📅 Año exacto (UX más simple)
      if (anio) {
        filter.anioPublicacion = Number(anio);
      }

      // ⭐ Rating mínimo
      if (ratingMin) {
        filter.rating = { $gte: Number(ratingMin) };
      }

      // 📦 Solo con stock
      if (stock === "true") {
        filter.stock = { $gt: 0 };
      }

      // 💰 Precio
      if (precioMin || precioMax) {
        filter.precio = {};
        if (precioMin) filter.precio.$gte = Number(precioMin);
        if (precioMax) filter.precio.$lte = Number(precioMax);
      }

    // orden
let sortObj = {};

// precio
if (sort === "precio-asc") sortObj = { precio: 1 };
if (sort === "precio-desc") sortObj = { precio: -1 };

// nombre (A-Z / Z-A)
if (sort === "nombre-asc") sortObj = { nombre: 1 };
if (sort === "nombre-desc") sortObj = { nombre: -1 };

// año (más viejo / más nuevo)
if (sort === "anio-asc") sortObj = { anioPublicacion: 1 };
if (sort === "anio-desc") sortObj = { anioPublicacion: -1 };

      const data = await this.services.getAll({
        filter,
        sort: sortObj,
        limit: Number(limit) || 40,
        page: Number(page) || 1,
      });

      req.logger.info("Productos obtenidos correctamente (filtros avanzados)");
      createResponse(res, 200, data);
    } catch (error) {
      req.logger.error("Error al obtener productos: " + error.message);
      next(error);
    }
  };

  // ===============================
  // GET BY ID
  // ===============================
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;

      await this.services.incrementView(id);
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

  // ===============================
  // CREATE
  // ===============================
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

  // ===============================
  // UPDATE
  // ===============================
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const productUpdated = await this.services.update(id, req.body);

      if (!productUpdated) {
        req.logger.warn(`Producto inexistente ID ${id}`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      req.logger.info(`Producto actualizado: ${id}`);
      res.json(productUpdated);
    } catch (error) {
      req.logger.error("Error al actualizar producto: " + error.message);
      next(error);
    }
  };

  // ===============================
  // DELETE
  // ===============================
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const prodDel = await this.services.remove(id);

      if (!prodDel) {
        req.logger.warn(`Producto inexistente ID ${id}`);
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      req.logger.info(`Producto eliminado: ${id}`);
      res.json(prodDel);
    } catch (error) {
      req.logger.error("Error al eliminar producto: " + error.message);
      next(error);
    }
  };

  // ===============================
  // HOME
  // ===============================
  getFeatured = async (req, res, next) => {
    try {
      const products = await this.services.getFeatured();
      createResponse(res, 200, products);
    } catch (error) {
      next(error);
    }
  };

  getPopular = async (req, res, next) => {
    try {
      const products = await this.services.getPopular();
      createResponse(res, 200, products);
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController(productServices);


