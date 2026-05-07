import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { passportCall } from "../Middlewares/passport.call.js";

const PaymentRouter = Router();

PaymentRouter.post(
  "/create-preference",
  passportCall("jwt", { session: false }),
  paymentController.createPreference
);

PaymentRouter.post("/webhook", paymentController.webhook);

PaymentRouter.get(
  "/status/:paymentId",
  passportCall("jwt", { session: false }),
  paymentController.getPaymentStatus
);

export default PaymentRouter;