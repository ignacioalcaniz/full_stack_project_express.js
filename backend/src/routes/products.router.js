import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { productController } from "../controllers/product.controller.js";
import { validateSchema } from "../Middlewares/validateSchema.js";
import { productCreateSchema,productUpdateSchema } from "../Middlewares/validators/product.validator.js";

const Productrouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Operaciones CRUD con productos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Obtener todos los productos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
Productrouter.get("/", [passportCall("jwt", { session: false })], productController.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtener un producto por ID
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
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
Productrouter.get("/:id", [passportCall("jwt", { session: false })], productController.getById);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Crear un nuevo producto (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado
 */
Productrouter.post(
  "/",
  [passportCall("jwt", { session: false }), checkRole(["admin"]), validateSchema(productCreateSchema)],
  productController.create
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Actualizar un producto por ID (solo admin)
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Producto no encontrado
 */
Productrouter.put(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"]), validateSchema(productUpdateSchema)],
  productController.update
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Eliminar un producto por ID (solo admin)
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
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
Productrouter.delete(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  productController.delete
);

export default Productrouter;





