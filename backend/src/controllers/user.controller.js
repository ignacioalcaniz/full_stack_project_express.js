import { userServices } from "../services/user.services.js";
import { createResponse } from "../utils/user.utils.js";

export default class UserController {
  constructor(services) {
    this.services = services;
  }

  register = async (req, res, next) => {
    try {
      const data = await this.services.register(req.body);
      createResponse(res, 201, data);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const token = await this.services.login(req.body);
      res.cookie("token", token, { httpOnly: true });
      createResponse(res, 200, token);
    } catch (error) {
      next(error);
    }
  };

  profile = async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await this.services.getUserById(id);
      createResponse(res, 200, user);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController(userServices)