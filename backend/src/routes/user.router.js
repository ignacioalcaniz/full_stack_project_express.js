// src/routes/user.router.js
import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { registerSchema, loginSchema } from "../Middlewares/validators/user.validator.js";
import { loginLimiter, registerLimiter } from "../Middlewares/rate.middleware.js";
import { verifyCaptcha } from "../Middlewares/captcha.middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operaciones relacionadas con usuarios (registro, login, autenticación 2FA, tokens, logout y perfil)
 *
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - age
 *         - email
 *         - password
 *         - captchaToken
 *       properties:
 *         first_name:
 *           type: string
 *           example: Ignacio
 *         last_name:
 *           type: string
 *           example: Alcañiz
 *         age:
 *           type: integer
 *           example: 20
 *         email:
 *           type: string
 *           example: ignaalcaniz@gmail.com
 *         password:
 *           type: string
 *           example: Miramar2025!
 *         captchaToken:
 *           type: string
 *           description: Token generado por Google reCAPTCHA v2 o v3
 *           example: "03AFY_a8JkDlvfaXyC0hS3vH1O-0D5n7fsZzT4bKJ4i2E..."
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: StrongPassword123!
 *         twoFAToken:
 *           type: string
 *           example: "123456"
 */

const UserRouter = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Registrar un nuevo usuario
 *     description: Crea una cuenta nueva con verificación de CAPTCHA y validación de contraseña fuerte (zxcvbn score ≥ 3).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: Contraseña débil o error de validación
 *       403:
 *         description: Captcha inválido
 */
UserRouter.post(
  "/register",
  registerLimiter,
   verifyCaptcha,
  validateSchema(registerSchema),
  userController.register
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Iniciar sesión
 *     description: Permite el login con email y contraseña. Si el usuario tiene 2FA habilitado, deberá enviar el código TOTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve access token
 *       206:
 *         description: 2FA requerido, el usuario debe enviar el código TOTP
 *       401:
 *         description: Credenciales o código 2FA inválidos
 *       403:
 *         description: Captcha inválido
 */
UserRouter.post(
  "/login",
  loginLimiter,
   verifyCaptcha,
  validateSchema(loginSchema),
  userController.login
);

/**
 * @swagger
 * /users/2fa/setup:
 *   post:
 *     tags: [Users]
 *     summary: Generar y habilitar 2FA (Two-Factor Authentication)
 *     description: Genera un secreto único y un código QR para escanear con Google Authenticator. Solo usuarios autenticados.
 *     security:
 *       - bearerAuth: []
 */
UserRouter.post(
  "/2fa/setup",
  passportCall("jwt", { session: false }),
  userController.setup2FA
);

/**
 * @swagger
 * /users/2fa/verify:
 *   post:
 *     tags: [Users]
 *     summary: Verificar código 2FA
 *     description: Verifica el código TOTP ingresado por el usuario para activar la autenticación en dos pasos.
 *     security:
 *       - bearerAuth: []
 */
UserRouter.post(
  "/2fa/verify",
  passportCall("jwt", { session: false }),
  userController.verify2FA
);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Renovar el access token
 */
UserRouter.post("/refresh", userController.refresh);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Cerrar sesión
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
 */
UserRouter.get(
  "/profile",
  passportCall("jwt", { session: false }),
  userController.profile
);

export default UserRouter;







