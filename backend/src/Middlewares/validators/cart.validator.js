
import Joi from "joi";

// Crear carrito (puede estar vacío o con productos)
export const cartCreateSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1),
      })
    )
    .default([]),
});

// Actualizar carrito completo
export const cartUpdateSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .required(),
});

// Actualizar cantidad de un producto en carrito
export const cartUpdateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});