import Joi from "joi";

export const ticketSchema = Joi.object({
  cartId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) 
    .required()
    .messages({
      "string.empty": "El cartId no puede estar vacío",
      "string.pattern.base": "El cartId debe ser un ObjectId válido de MongoDB",
      "any.required": "El cartId es obligatorio"
    }),
});
