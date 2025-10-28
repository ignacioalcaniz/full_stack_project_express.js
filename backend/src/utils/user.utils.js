// src/utils/user.utils.js
import bcrypt from "bcrypt";

const pepper = process.env.PEPPER_SECRET || "";

/**
 * Crea un hash seguro con bcrypt (12 rounds + pepper)
 */
export const createHash = (password) => {
  const salted = password + pepper;
  return bcrypt.hashSync(salted, bcrypt.genSaltSync(12));
};

/**
 * Valida contraseña en texto plano comparando con hash almacenado
 */
export const isValidPassword = (passwordPlain, passwordHash) => {
  const salted = passwordPlain + pepper;
  return bcrypt.compareSync(salted, passwordHash);
};

/**
 * Helper de respuesta JSON uniforme
 */
export const createResponse = (res, statusCode, data) => {
  return res.status(statusCode).json({ data });
};


