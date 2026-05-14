// src/controllers/orders.helper.js
import { TicketModel } from "../model/ticket.model.js"; // AJUSTAR si tu modelo está en otro archivo

export async function getLastOrders(userId) {
  if (!userId) return [];

  const orders = await TicketModel.find({ purchaser: userId })
    .sort({ purchase_datetime: -1 })
    .limit(5)
    .lean();

  return orders.map((o) => ({
    id: o._id.toString(),
    date: o.purchase_datetime,
    total: o.amount,
    products: o.products?.length || 0,
  }));
}
