import TicketDaoMongo from "../daos/ticket.dao.js";
import { productServices } from "./products.services.js";
import { cartServices } from "./carrito.services.js";
import { CustomError } from "../utils/error.custom.js";


export default class TicketServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateTicket = async (user) => {
    try {
      const cart = await cartServices.getById(user.cart);
      let amountAcc = 0;
      
      for (const prod of cart.products) {
        const idProd = prod.product;
        const prodDB = await productServices.getById(idProd);
        if (prod.quantity > prodDB.stock) {
         
          throw new CustomError(
            "la cantidad supera el stock del producto",
            404
          );
        }
        const amount = prod.quantity * prodDB.price;
        amountAcc += amount;
      }

      const ticket = await this.dao.create({
        code: `${Math.random() * 1000}`,
        purchase_datetime: new Date().toLocaleString(),
        amount: amountAcc,
        purchaser: user.email,
      });
      await cartServices.clearCart(user.cart);
      return ticket;
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const ticketServices = new TicketServices(TicketDaoMongo);