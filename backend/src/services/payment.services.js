import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { CustomError } from "../utils/error.custom.js";
import { cartServices } from "./carrito.services.js";
import { ticketServices } from "./ticket.services.js";

class PaymentServices {
  getClient() {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

    if (!accessToken) {
      throw new CustomError("MP_ACCESS_TOKEN no está configurado.", 500);
    }

    return new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });
  }

  getPreferenceClient() {
    return new Preference(this.getClient());
  }

  getPaymentClient() {
    return new Payment(this.getClient());
  }

  createExternalReference(userId) {
    return `thelibrary_${userId}_${Date.now()}`;
  }

  getBackUrls() {
    const success =
      process.env.MP_SUCCESS_URL?.trim() ||
      "https://www.thelibrarystore.it.com/tienda/gracias";

    const pending =
      process.env.MP_PENDING_URL?.trim() ||
      "https://www.thelibrarystore.it.com/tienda/gracias";

    const failure =
      process.env.MP_FAILURE_URL?.trim() ||
      "https://www.thelibrarystore.it.com/tienda/checkout";

    if (!success || !pending || !failure) {
      throw new CustomError("Faltan URLs de retorno de Mercado Pago", 500);
    }

    return { success, pending, failure };
  }

  getNotificationUrl() {
    const value = process.env.MP_WEBHOOK_URL?.trim();
    if (!value) return undefined;
    if (!/^https:\/\//i.test(value)) return undefined;
    return value;
  }

  getPaymentMethodsConfig(mode = "mercadopago", installments = 1) {
    const safeInstallments = Number.isFinite(Number(installments))
      ? Math.max(1, Math.min(12, Number(installments)))
      : 1;

    if (mode === "card_credit") {
      return {
        installments: safeInstallments,
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      };
    }

    if (mode === "card_debit") {
      return {
        installments: 1,
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      };
    }

    if (mode === "mercadopago") {
      return {
        excluded_payment_types: [{ id: "ticket" }],
      };
    }

    throw new CustomError("Modo de pago inválido para Mercado Pago", 400);
  }

  sanitizeCustomerDraft(customerDraft = {}) {
    return {
      name: String(customerDraft?.name || "").trim(),
      lastName: String(customerDraft?.lastName || "").trim(),
    };
  }

  async createPreferenceForUser(user, options = {}) {
    const {
      mode = "mercadopago",
      installments = 1,
      customerDraft = {},
    } = options;

    if (!user) throw new CustomError("Usuario no autenticado", 401);
    if (!user.cart) {
      throw new CustomError("El usuario no tiene carrito asignado", 404);
    }

    const cart = await cartServices.getById(user.cart);
    if (!cart?.products?.length) {
      throw new CustomError("El carrito está vacío", 400);
    }

    const items = cart.products
      .map((it) => {
        const p = it.product;
        if (!p) return null;

        return {
          id: String(p._id),
          title: p.nombre,
          description: p.descripcion || p.nombre,
          quantity: Number(it.quantity || 1),
          currency_id: "ARS",
          unit_price: Number(p.precio || 0),
          picture_url: p.imagen || undefined,
        };
      })
      .filter(Boolean);

    if (!items.length) {
      throw new CustomError("No hay productos válidos para pagar", 400);
    }

    const externalReference = this.createExternalReference(user._id.toString());
    const backUrls = this.getBackUrls();
    const notificationUrl = this.getNotificationUrl();
    const paymentMethods = this.getPaymentMethodsConfig(mode, installments);
    const cleanDraft = this.sanitizeCustomerDraft(customerDraft);

    const body = {
      items,
      payer: {
        email: user.email,
        name: cleanDraft.name || user.first_name || "",
        surname: cleanDraft.lastName || user.last_name || "",
      },
      external_reference: externalReference,
      metadata: {
        userId: user._id.toString(),
        cartId: user.cart.toString(),
        integration: "the-library-checkout-pro",
        checkoutMode: mode,
      },
      back_urls: {
        success: backUrls.success,
        pending: backUrls.pending,
        failure: backUrls.failure,
      },
      auto_return: "approved",
      statement_descriptor: "THELIBRARY",
      payment_methods: paymentMethods,
    };

    if (notificationUrl) {
      body.notification_url = notificationUrl;
    }

    try {
      const preferenceClient = this.getPreferenceClient();
      const response = await preferenceClient.create({ body });

      return {
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
        externalReference,
        backUrls,
      };
    } catch (error) {
      const apiMessage =
        error?.cause?.[0]?.description ||
        error?.cause?.[0]?.message ||
        error?.message ||
        "No se pudo crear la preferencia de pago.";

      throw new CustomError(apiMessage, 400);
    }
  }

  async getPaymentById(paymentId) {
    if (!paymentId) throw new CustomError("paymentId requerido", 400);

    const paymentClient = this.getPaymentClient();
    return await paymentClient.get({ id: Number(paymentId) });
  }

  async processWebhookPayment(paymentId) {
    const payment = await this.getPaymentById(paymentId);
    return await ticketServices.finalizeMercadoPagoPayment(payment);
  }

  async getPaymentStatus(paymentId) {
    const payment = await this.getPaymentById(paymentId);

    return {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      preference_id: payment.order?.id || payment.preference_id || null,
      metadata: payment.metadata || {},
    };
  }
}

export const paymentServices = new PaymentServices();