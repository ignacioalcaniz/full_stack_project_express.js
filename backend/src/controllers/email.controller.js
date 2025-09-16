// src/controllers/email.controller.js
import { sendWelcomeEmail } from "../services/email.services.js";

export const sendMailEth = async (req, res, next) => {
  try {
    const { email, first_name, last_name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El campo 'email' es obligatorio" });
    }

    // Enviar email de bienvenida
    const response = await sendWelcomeEmail({
      email,
      first_name: first_name || "Usuario",
      last_name: last_name || "",
    });

    req.logger?.info?.(`📧 Correo de prueba enviado a ${email}`);
    res.status(200).json({
      message: "Correo enviado con éxito",
      details: response,
    });
  } catch (error) {
    req.logger?.error?.(`❌ Error al enviar correo: ${error.message}`);
    next(error);
  }
};

