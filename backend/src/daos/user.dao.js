import { UserModel } from "../model/user.model.js";
import MongoDao from "./mongo.dao.js";
import { CartDao } from "./cart.dao.js";

export default class UserDaoMongo extends MongoDao {
  constructor(model) {
    super(model);
  }

  getByEmail = async (email) => {
    try {
      return await this.model.findOne({ email });
    } catch (error) {
      throw new Error(error);
    }
  };

  getUserById = async (id) => {
    try {
      return await this.model.findById(id).populate("cart");
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const userDaoMongo = new UserDaoMongo(UserModel);