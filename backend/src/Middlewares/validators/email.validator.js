import Joi from "joi";

export const emailSchema = Joi.object({
  to: Joi.string().email().required().messages({
    "string.email": "El campo 'to' debe ser un email válido",
    "any.required": "El campo 'to' es obligatorio"
  }),
  subject: Joi.string().min(3).max(100).required().messages({
    "string.min": "El asunto debe tener al menos 3 caracteres",
    "string.max": "El asunto no puede superar los 100 caracteres",
    "any.required": "El campo 'subject' es obligatorio"
  }),
  message: Joi.string().min(5).required().messages({
    "string.min": "El mensaje debe tener al menos 5 caracteres",
    "any.required": "El campo 'message' es obligatorio"
  })
});
