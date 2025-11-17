// src/Middlewares/validate.middleware.js
// Validador de ObjectId y sanitización de params básicos (sin tocar tu validateSchema.js)

import mongoose from "mongoose";

// Asegura que el param dado sea un ObjectId válido (24 hex)
export function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Parámetro ${paramName} inválido` });
    }
    next();
  };
}

// (Opcional) En caso de necesitar validar múltiples params como ObjectId
export function validateObjectIds(paramNames = []) {
  return (req, res, next) => {
    for (const p of paramNames) {
      const val = req.params[p];
      if (!val || !mongoose.Types.ObjectId.isValid(val)) {
        return res.status(400).json({ error: `Parámetro ${p} inválido` });
      }
    }
    next();
  };
}

