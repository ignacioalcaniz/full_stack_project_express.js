import Joi from "joi";

export const productCreateSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required()
});

export const productUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  price: Joi.number().positive()
}).min(1);