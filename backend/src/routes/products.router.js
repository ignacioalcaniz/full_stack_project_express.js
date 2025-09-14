import { Router } from "express";
import { passportCall } from "../Middlewares/passport.call.js";
import { checkRole } from "../Middlewares/check.role.js";
import { productController } from "../controllers/product.controller.js";

const Productrouter = Router();

Productrouter.get("/", [passportCall("jwt", { session: false })], productController.getAll);

Productrouter.get(
  "/:id",
  [passportCall("jwt", { session: false })],
  productController.getById
);

Productrouter.post(
  "/",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  productController.create
);

Productrouter.put(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  productController.update
);

Productrouter.delete(
  "/:id",
  [passportCall("jwt", { session: false }), checkRole(["admin"])],
  productController.delete
);

export default Productrouter;



