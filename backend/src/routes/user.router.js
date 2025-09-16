import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";

const UserRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operaciones de usuarios (registro, login y perfil)
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
 *         description: Login exitoso (devuelve JWT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 */
UserRouter.post(
  "/login",
  validateSchema(loginSchema),
  userController.login
);

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
