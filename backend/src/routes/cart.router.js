import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { cartController } from "../controllers/cart.controller.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import {
  cartCreateSchema,
  cartUpdateSchema,
  cartUpdateQuantitySchema
} from "../validators/cart.validator.js";

const CartRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Carts
 *     description: Operaciones con carritos de compra
 */

/**
 * @swagger
 * /carts:
 *   get:
 *     tags: [Carts]
 *     summary: Obtener todos los carritos (solo admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
 */
CartRouter.get("/", [passportCall("jwt", { session: false }), checkRole(["admin"])], cartController.getAll);

/**
 * @swagger
 * /carts/{id}:
 *   get:
 *     tags: [Carts]
 *     summary: Obtener un carrito por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito encontrado
 *       404:
 *         description: Carrito no encontrado
 */
CartRouter.get("/:id", [passportCall("jwt", { session: false })], cartController.getById);

/**
 * @swagger
 * /carts:
 *   post:
 *     tags: [Carts]
 *     summary: Crear un nuevo carrito (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       201:
 *         description: Carrito creado
 *       400:
 *         description: Error de validación
 */
CartRouter.post(
  "/",
  [passportCall("jwt", { session: false }), checkRole(["admin"]), validateSchema(cartCreateSchema)],
  cartController.create
);

/**
 * @swagger
 * /carts/{id}:
 *   put:
 *     tags: [Carts]
 *     summary: Actualizar un carrito por ID (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Carrito no encontrado
 */
CartRouter.put(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"]), validateSchema(cartUpdateSchema)],
  cartController.update
);

/**
 * @swagger
 * /carts/{id}:
 *   delete:
 *     tags: [Carts]
 *     summary: Eliminar un carrito por ID (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito eliminado
 */
CartRouter.delete("/:id", [passportCall("jwt", { session: false }), checkRole(["admin"])], cartController.delete);

/**
 * @swagger
 * /carts/products/{idProd}:
 *   post:
 *     tags: [Carts]
 *     summary: Agregar un producto al carrito del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProd
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 */
CartRouter.post("/products/:idProd", [passportCall("jwt", { session: false })], cartController.addProdToCart);

/**
 * @swagger
 * /carts/{idCart}/products/{idProd}:
 *   delete:
 *     tags: [Carts]
 *     summary: Eliminar un producto de un carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCart
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idProd
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 */
CartRouter.delete("/:idCart/products/:idProd", [passportCall("jwt", { session: false })], cartController.removeProdToCart);

/**
 * @swagger
 * /carts/{idCart}/products/{idProd}:
 *   put:
 *     tags: [Carts]
 *     summary: Actualizar cantidad de un producto en el carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCart
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idProd
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *             example:
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: Error de validación
 */
CartRouter.put(
  "/:idCart/products/:idProd",
  [passportCall("jwt", { session: false }), validateSchema(cartUpdateQuantitySchema)],
  cartController.updateProdQuantityToCart
);

/**
 * @swagger
 * /carts/clear/{idCart}:
 *   delete:
 *     tags: [Carts]
 *     summary: Vaciar un carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCart
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito vaciado
 */
CartRouter.delete("/clear/:idCart", [passportCall("jwt", { session: false })], cartController.clearCart);

export default CartRouter;











