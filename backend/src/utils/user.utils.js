// src/utils/user.utils.js
import bcrypt from "bcrypt";



const pepper = process.env.PEPPER_SECRET || "";

// tomamos los rounds del .env o usamos 10 por defecto
const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

/**
 * Crea un hash seguro con bcrypt (10 rounds + pepper)
 */

export const createHash = (password) => {
  const salted = password + pepper;
  return bcrypt.hashSync(salted, bcrypt.genSaltSync(rounds));
};

/**
 * Valida contraseña en texto plano comparando con hash almacenado
 */
export const isValidPassword = (passwordPlain, passwordHash) => {
  return bcrypt.compareSync(passwordPlain + pepper, passwordHash)
    || bcrypt.compareSync(passwordPlain, passwordHash);
};

/**
 * Helper de respuesta JSON uniforme
 */
export const createResponse = (res, statusCode, data) => {
  return res.status(statusCode).json({ data });
};


