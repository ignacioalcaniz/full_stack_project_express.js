import { configMailHbs, transporter } from "../services/email.services.js";

export const sendMailEth = async (req, res, next) => {
  try {
    const response = await transporter.sendMail(configMailHbs);

    req.logger.info(`Correo enviado exitosamente a ${configMailHbs.to}`);
    res.json(response);
  } catch (error) {
    req.logger.error(`Error al enviar correo: ${error.message}`);
    next(error);
  }
};
