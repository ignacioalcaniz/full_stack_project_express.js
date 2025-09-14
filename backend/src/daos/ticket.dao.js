import MongoDao from "./mongo.dao.js";
import { TicketModel } from "../model/ticket.model.js";

export default class TicketDaoMongo extends MongoDao {
  constructor(model) {
    super(model);
  }
}

export const ticketDaoMongo = new TicketDaoMongo(TicketModel);