// src/Middlewares/validators/user.validator.js
import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "El nombre es obligatorio",
      "string.min": "El nombre debe tener al menos 2 caracteres",
    }),

  last_name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "El apellido es obligatorio",
    }),

  age: Joi.number()
    .integer()
    .min(13)
    .max(120)
    .required()
    .messages({
      "number.base": "La edad debe ser un número",
      "number.min": "Debes tener al menos 13 años",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "El correo electrónico no es válido",
      "string.empty": "El correo electrónico es obligatorio",
    }),

  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .required()
    .messages({
      "string.min": "La contraseña debe tener al menos 8 caracteres",
      "string.pattern.base": "La contraseña debe incluir una mayúscula, un número y un símbolo",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


  