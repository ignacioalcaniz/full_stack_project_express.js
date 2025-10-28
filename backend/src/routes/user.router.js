// src/routes/user.router.js
import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { registerSchema, loginSchema } from "../Middlewares/validators/user.validator.js";
import { loginRateLimiter } from "../Middlewares/security.middleware.js";
import { registerLimiter } from "../Middlewares/rate.sensitive.js";

const UserRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operaciones de usuarios (registro, login, refresh, logout y perfil)
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: Error de validación
 */
UserRouter.post(
  "/register",
  registerLimiter,
  validateSchema(registerSchema),
  userController.register
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCredentials'
 *     responses:
 *       200:
 *         description: Login exitoso (devuelve access token y refresh en cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 */
UserRouter.post(
  "/login",
  loginRateLimiter,
  validateSchema(loginSchema),
  userController.login
);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Obtener un nuevo access token usando el refresh token
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token no encontrado
 *       403:
 *         description: Refresh token inválido o expirado
 */
UserRouter.post("/refresh", userController.refresh);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Cerrar sesión del usuario (borra cookie con refresh token)
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
UserRouter.post("/logout", userController.logout);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado (falta o token inválido)
 */
UserRouter.get(
  "/profile",
  passportCall("jwt", { session: false }),
  userController.profile
);

export default UserRouter;


