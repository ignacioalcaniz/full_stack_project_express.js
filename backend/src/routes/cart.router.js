import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { cartController } from "../controllers/cart.controller.js";

const CartRouter = Router();

CartRouter.get(
  "/",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  cartController.getAll
);

CartRouter.get(
  "/:id",
  [passportCall("jwt", { session: false })],
  cartController.getById
);

CartRouter.post(
  "/",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  cartController.create
);

CartRouter.put(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  cartController.update
);

CartRouter.delete(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  cartController.delete
);

CartRouter.post(
  "/products/:idProd",
  [passportCall("jwt", { session: false })],
  cartController.addProdToCart
);

CartRouter.delete(
  "/:idCart/products/:idProd",
  [passportCall("jwt", { session: false })],
  cartController.removeProdToCart
);

CartRouter.put(
  "/:idCart/products/:idProd",
  [passportCall("jwt", { session: false })],
  cartController.updateProdQuantityToCart
);

CartRouter.delete(
  "/clear/:idCart",
  [passportCall("jwt", { session: false })],
  cartController.clearCart
);

export default CartRouter;








