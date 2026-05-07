import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import {
  registerSchema,
  loginSchema,
  loginEmailOtpVerifySchema,
  verify2FASchema,
  updateProfileSchema,
  updateSecurityPreferencesSchema,
  changePasswordSchema,
} from "../Middlewares/validators/user.validator.js";
import { loginLimiter, registerLimiter } from "../Middlewares/rate.middleware.js";
import { verifyCaptcha } from "../Middlewares/captcha.middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operaciones relacionadas con usuarios (registro, login, OTP por email, recuperación de contraseña, tokens, logout, perfil y compras)
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
 *           example: 25
 *         email:
 *           type: string
 *           example: ignaalcaniz@gmail.com
 *         password:
 *           type: string
 *           example: StrongPass2026!
 *         captchaToken:
 *           type: string
 *           example: captcha-token
 *
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: ignaalcaniz@gmail.com
 *         password:
 *           type: string
 *           example: StrongPass2026!
 *
 *     LoginEmailOtpVerify:
 *       type: object
 *       required:
 *         - pendingToken
 *         - code
 *       properties:
 *         pendingToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         code:
 *           type: string
 *           example: "123456"
 *
 *     EmailOtpVerify:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           example: "123456"
 *
 *     ForgotPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: ignaalcaniz@gmail.com
 *
 *     ResetPassword:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiJ9.randomtoken
 *         newPassword:
 *           type: string
 *           example: StrongPass2027!
 *
 *     UserProfileUpdate:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: Ignacio
 *         last_name:
 *           type: string
 *           example: Alcañiz
 *         age:
 *           type: integer
 *           example: 26
 *         avatarUrl:
 *           type: string
 *           example: https://res.cloudinary.com/demo/image/upload/avatar.png
 *         phone:
 *           type: string
 *           example: +54 351 1234567
 *         address:
 *           type: string
 *           example: Córdoba, Argentina
 *         preferences:
 *           type: object
 *           properties:
 *             newsletter:
 *               type: boolean
 *             notifications:
 *               type: boolean
 *             publicProfile:
 *               type: boolean
 *
 *     UserSecurityPreferencesUpdate:
 *       type: object
 *       properties:
 *         loginAlerts:
 *           type: boolean
 *         purchaseAlerts:
 *           type: boolean
 *
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: StrongPass2025!
 *         newPassword:
 *           type: string
 *           example: StrongPass2026!
 */

const UserRouter = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Registrar un nuevo usuario
 *     description: Crea una cuenta con validación de CAPTCHA y política de contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación
 *       403:
 *         description: CAPTCHA inválido
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
 *     description: Si la cuenta requiere verificación por email, responde 206 con pendingToken.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       206:
 *         description: Verificación por email requerida
 *       401:
 *         description: Credenciales inválidas
 */
UserRouter.post(
  "/login",
  loginLimiter,
  validateSchema(loginSchema),
  userController.login
);

/**
 * @swagger
 * /users/login/verify-email-otp:
 *   post:
 *     tags: [Users]
 *     summary: Verificar OTP por email para completar el login
 *     description: Completa el login cuando el backend respondió 206 y envió código por email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginEmailOtpVerify'
 *     responses:
 *       200:
 *         description: Login completado correctamente
 *       401:
 *         description: Código inválido o expirado
 */
UserRouter.post(
  "/login/verify-email-otp",
  loginLimiter,
  validateSchema(loginEmailOtpVerifySchema),
  userController.verifyLoginEmailOtp
);

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Solicitar recuperación de contraseña
 *     description: Si el correo existe, envía un enlace seguro para restablecer la contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Solicitud procesada correctamente
 */
UserRouter.post("/forgot-password", userController.forgotPassword);

/**
 * @swagger
 * /users/reset-password/validate:
 *   get:
 *     tags: [Users]
 *     summary: Validar token de recuperación
 *     description: Verifica si el token de recuperación sigue siendo válido.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
UserRouter.get(
  "/reset-password/validate",
  userController.validateResetPasswordToken
);

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña usando un token de recuperación válido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token inválido o expirado
 */
UserRouter.post("/reset-password", userController.resetPassword);

/**
 * @swagger
 * /users/2fa/setup:
 *   post:
 *     tags: [Users]
 *     summary: Iniciar activación de verificación por email
 *     description: Envía un código al email del usuario autenticado para activar protección adicional.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código enviado correctamente
 *       401:
 *         description: No autenticado
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
 *     summary: Verificar código para activar protección por email
 *     description: Valida el código recibido por email y activa la protección adicional de la cuenta.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailOtpVerify'
 *     responses:
 *       200:
 *         description: Protección activada correctamente
 *       401:
 *         description: Código inválido o expirado
 */
UserRouter.post(
  "/2fa/verify",
  passportCall("jwt", { session: false }),
  validateSchema(verify2FASchema),
  userController.verify2FA
);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Renovar access token
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 *       401:
 *         description: No refresh token
 *       403:
 *         description: Refresh inválido o expirado
 */
UserRouter.post("/refresh", userController.refresh);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Cerrar sesión
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
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: No autenticado
 */
UserRouter.get(
  "/profile",
  passportCall("jwt", { session: false }),
  userController.profile
);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Error de validación
 */
UserRouter.patch(
  "/profile",
  passportCall("jwt", { session: false }),
  validateSchema(updateProfileSchema),
  userController.updateProfile
);

/**
 * @swagger
 * /users/profile/security:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar preferencias de seguridad del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSecurityPreferencesUpdate'
 *     responses:
 *       200:
 *         description: Preferencias de seguridad actualizadas
 *       400:
 *         description: Error de validación
 */
UserRouter.patch(
  "/profile/security",
  passportCall("jwt", { session: false }),
  validateSchema(updateSecurityPreferencesSchema),
  userController.updateSecurityPreferences
);

/**
 * @swagger
 * /users/profile/password:
 *   patch:
 *     tags: [Users]
 *     summary: Cambiar contraseña del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Contraseña actual incorrecta
 */
UserRouter.patch(
  "/profile/password",
  passportCall("jwt", { session: false }),
  validateSchema(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /users/me/orders:
 *   get:
 *     tags: [Users]
 *     summary: Obtener historial completo de compras del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente
 *       401:
 *         description: No autenticado
 */
UserRouter.get(
  "/me/orders",
  passportCall("jwt", { session: false }),
  userController.getMyOrders
);

export default UserRouter;







