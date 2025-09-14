import path from "path";
import { createTransport } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { templateHtml } from "../utils/template.js";
import "dotenv/config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const transporter = createTransport({
  service: 'gmail',
  port: 465,
  auth: {
    user: "ignaalcaniz@gmail.com",
    pass: "fcka kmjc jywo kvsl",
  },
});

const hbsConfig = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../views"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../views"),
  extName: ".handlebars",
};


transporter.use('compile', hbs(hbsConfig))


export const configMail = {
  from: "ignaalcaniz@gmail.com",
  to: "ignaalcaniz@gmail.com",
  subject: "Bienvenido/a",

  html: templateHtml,
  attachments: [
    {
      path: process.cwd() + "/src/utils/test.txt",
      filename: "resumen-de-cuenta.txt",
    },
  ],
};

export const configMailHbs = {
    from: process.env.USER_GOOGLE,
    to: process.env.USER_GOOGLE,
    subject: "Bienvenido/a",
    template: 'email',
    context: {
        name: 'ignacio',
        text: 'Te estabamos esperando'
    }
  };