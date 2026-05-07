import { paymentServices } from "../services/payment.services.js";
import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

export const paymentController = {
  createPreference: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const {
        mode = "mercadopago",
        installments = 1,
        customerDraft = {},
      } = req.body || {};

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const user = await userServices.getUserById(userId);

      const data = await paymentServices.createPreferenceForUser(user, {
        mode,
        installments,
        customerDraft,
      });

      return createResponse(res, 200, data);
    } catch (error) {
      return next(error);
    }
  },

  webhook: async (req, res, next) => {
    try {
      const topic =
        req.query.type ||
        req.query.topic ||
        req.body?.type ||
        req.body?.action ||
        "";

      const paymentId =
        req.query["data.id"] ||
        req.query.id ||
        req.body?.data?.id ||
        req.body?.id ||
        null;

      // Mercado Pago espera respuesta rápida
      if (!paymentId) {
        return res.status(200).json({ ok: true, ignored: true });
      }

      if (
        String(topic).includes("payment") ||
        req.body?.type === "payment"
      ) {
        await paymentServices.processWebhookPayment(paymentId);
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      return next(error);
    }
  },

  getPaymentStatus: async (req, res, next) => {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({ error: "paymentId requerido" });
      }

      const data = await paymentServices.getPaymentStatus(paymentId);
      return createResponse(res, 200, data);
    } catch (error) {
      return next(error);
    }
  },
};