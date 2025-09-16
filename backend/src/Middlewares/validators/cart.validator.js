

import Joi from "joi";

export const addProductSchema = Joi.object({
  quantity: Joi.number().integer().min(1).default(1)
});

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});