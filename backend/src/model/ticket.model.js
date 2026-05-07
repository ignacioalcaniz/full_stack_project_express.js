import { Schema, model } from "mongoose";

export const ticketSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true },

    status: {
      type: String,
      enum: ["paid", "processing", "completed", "cancelled"],
      default: "paid",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "transfer", "cash"],
      default: "card",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid",
      index: true,
    },

    paymentConfirmedAt: {
      type: Date,
      default: null,
    },

    paymentConfirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    mercadoPago: {
      paymentId: { type: Number, default: null, index: true, sparse: true },
      preferenceId: { type: String, default: null },
      merchantOrderId: { type: String, default: null },
      externalReference: { type: String, default: null, index: true },
      status: { type: String, default: null },
      statusDetail: { type: String, default: null },
    },

    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "products" },
        title: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
        imagen: { type: String, default: null },
        image: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

export const TicketModel = model("tickets", ticketSchema);



