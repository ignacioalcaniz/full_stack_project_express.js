// src/daos/user.dao.js
import { UserModel } from "../model/user.model.js";
import MongoDao from "./mongo.dao.js";

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

  // OJO: devolvemos DOCUMENT (sin .lean) para poder modificar y save()
  getUserById = async (id) => {
    try {
      return await this.model.findById(id).populate("cart");
    } catch (error) {
      throw new Error(error);
    }
  };

  // create usa el create del model (ya está en MongoDao, si no está lo dejamos aquí)
  create = async (obj) => {
    try {
      return await this.model.create(obj);
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const userDaoMongo = new UserDaoMongo(UserModel);
