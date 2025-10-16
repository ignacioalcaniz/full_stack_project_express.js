import { Schema, model } from "mongoose";

export const ticketSchema = new Schema(
  {
    code: { type: String, required: true },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "products" },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const TicketModel = model("tickets", ticketSchema);

