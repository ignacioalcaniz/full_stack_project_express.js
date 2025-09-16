import jwt from "jsonwebtoken";
import "dotenv/config";
import { CustomError } from "../utils/error.custom.js";
import { userDaoMongo } from "../daos/user.dao.js";
import { createHash, isValidPassword } from "../utils/user.utils.js";
import UserDTO from "../dto/user.dto.js";
import { sendWelcomeEmail } from "./email.services.js";
import { CartDao } from "../daos/cart.dao.js";

class UserServices {
  constructor(dao) {
    this.dao = dao;
  }

  generateToken = (user, time = "20m") => {
    const payload = { id: user._id, role: user.role, cart: user.cart };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });
  };

  getByEmail = async (email) => this.dao.getByEmail(email);

  register = async (user) => {
    const { email, password } = user;
    const existUser = await this.dao.getByEmail(email);
    if (existUser) throw new CustomError("El usuario ya existe", 404);

    const cartUser = await CartDao.create();

    const isAdmin =
      email === process.env.EMAIL_ADMIN &&
      password === process.env.PASS_ADMIN;

    const created = await this.dao.create({
      ...user,
      password: createHash(password),
      role: isAdmin ? "admin" : (user.role || "user"),
      cart: cartUser._id,
    });

    // Mail de bienvenida (no bloqueante)
    sendWelcomeEmail({ first_name: created.first_name, email: created.email })
      .catch((err) => console.error("⚠️ Error enviando email bienvenida:", err.message));

    return created;
  };

  login = async ({ email, password }) => {
    const userExist = await this.getByEmail(email);
    if (!userExist) throw new CustomError("Credenciales incorrectas", 401);

    const passValid = isValidPassword(password, userExist.password);
    if (!passValid) throw new CustomError("Credenciales incorrectas", 401);

    return this.generateToken(userExist);
  };

  getUserById = async (id) => {
    const user = await this.dao.getUserById(id);
    return new UserDTO(user);
  };
}

export const userServices = new UserServices(userDaoMongo);

