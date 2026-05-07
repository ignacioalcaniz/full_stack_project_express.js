import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
  }),

  last_name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "El apellido es obligatorio",
  }),

  age: Joi.number().integer().min(13).max(120).required().messages({
    "number.base": "La edad debe ser un número",
    "number.min": "Debes tener al menos 13 años",
  }),

  email: Joi.string().email().required().messages({
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
      "string.pattern.base":
        "La contraseña debe incluir una mayúscula, un número y un símbolo",
    }),

  captchaToken: Joi.string().required().messages({
    "string.empty": "El captcha es obligatorio",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceId: Joi.string().max(255).optional().allow(""),
});

export const loginEmailOtpVerifySchema = Joi.object({
  pendingToken: Joi.string().required().messages({
    "string.empty": "El token pendiente es obligatorio",
  }),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "El código debe tener 6 dígitos",
      "string.empty": "El código es obligatorio",
    }),
  deviceId: Joi.string().max(255).optional().allow(""),
});

export const verify2FASchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "El código debe tener 6 dígitos",
      "string.empty": "El código es obligatorio",
    }),
});

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "El nombre debe tener al menos 2 caracteres",
  }),

  last_name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "El apellido debe tener al menos 2 caracteres",
  }),

  age: Joi.number().integer().min(13).max(120).optional().messages({
    "number.base": "La edad debe ser un número",
    "number.min": "Debes tener al menos 13 años",
  }),

  avatarUrl: Joi.string().allow("").optional(),

  phone: Joi.string().max(40).allow("").optional().messages({
    "string.max": "El teléfono no puede superar 40 caracteres",
  }),

  address: Joi.string().max(180).allow("").optional().messages({
    "string.max": "La dirección no puede superar 180 caracteres",
  }),

  preferences: Joi.object({
    newsletter: Joi.boolean().optional(),
    notifications: Joi.boolean().optional(),
    publicProfile: Joi.boolean().optional(),
  })
    .optional()
    .unknown(false),
}).min(1);

export const updateSecurityPreferencesSchema = Joi.object({
  loginAlerts: Joi.boolean().optional(),
  purchaseAlerts: Joi.boolean().optional(),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "La contraseña actual es obligatoria",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .required()
    .messages({
      "string.min": "La nueva contraseña debe tener al menos 8 caracteres",
      "string.pattern.base":
        "La nueva contraseña debe incluir una mayúscula, un número y un símbolo",
    }),
});


  