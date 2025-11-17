// src/services/chatbot.services.js
import twilio from "twilio";
import Fuse from "fuse.js";
import { FaqModel } from "../model/chatbot.model.js";
import { ChatLogModel } from "../model/chatLog.model.js";

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
let client = null;
if (TWILIO_SID && TWILIO_TOKEN) client = twilio(TWILIO_SID, TWILIO_TOKEN);

// Pequeña "memoria" por usuario (id o teléfono)
const memory = new Map();

function addToMemory(userKey, question, answer) {
  if (!memory.has(userKey)) memory.set(userKey, []);
  const history = memory.get(userKey);
  history.push({ question, answer });
  if (history.length > 3) history.shift(); // máximo 3 interacciones
  memory.set(userKey, history);
}

export function getUserMemory(userKey) {
  return memory.get(userKey) || [];
}


export async function getAnswer(question) {
  const faqs = await FaqModel.find().lean();

  // Si no hay FAQs cargadas todavía
  if (!faqs.length) return "No tengo información cargada todavía 🤖";

  // Configuración de Fuse.js
  const fuse = new Fuse(faqs, {
    keys: ["question"],
    threshold: 0.4, // sensibilidad: cuanto menor, más estricta
  });


  // Buscar coincidencias
  const result = fuse.search(question);

  if (result.length > 0) {
    return result[0].item.answer;
  }
    addToMemory("default", question, result.length > 0 ? result[0].item.answer : "No tengo una respuesta para eso todavía 🤖");
await ChatLogModel.create({
  user: "default",
  question,
  answer: result.length > 0 ? result[0].item.answer : "No tengo una respuesta para eso todavía 🤖",
});
  return "No tengo una respuesta para eso todavía 🤖";
}

export async function sendWhatsAppMessage({ to, message }) {
  if (!client) throw new Error("Twilio no configurado");

  const whatsappFrom = `whatsapp:${process.env.WHATSAPP_FROM}`;
  const whatsappTo = `whatsapp:${to}`;

  await client.messages.create({
    from: whatsappFrom,
    to: whatsappTo,
    body: message,
  });

  return { success: true };
}

