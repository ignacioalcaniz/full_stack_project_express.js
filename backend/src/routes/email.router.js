import { Router } from "express";
import { sendMailEth } from "../controllers/email.controller.js";


const emailRouter = Router();

emailRouter.post("/send", sendMailEth);

export default emailRouter ;