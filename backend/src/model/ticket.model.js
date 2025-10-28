// src/model/ticket.model.js
import { Schema, model } from "mongoose";

export const ticketSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "products" },
        title: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
        imagen: { type: String, default: null }, // url en español
        image: { type: String, default: null }, // url en inglés (compatibilidad)
      },
    ],
  },
  { timestamps: true }
);

export const TicketModel = model("tickets", ticketSchema);



