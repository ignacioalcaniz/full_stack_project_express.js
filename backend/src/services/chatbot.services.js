// src/services/chatbot.services.js
import Fuse from "fuse.js";
import twilio from "twilio";
import { FaqModel, ChatLogModel } from "../model/chatbot.model.js";
import { ProductModel } from "../model/product.model.js";
import { TicketModel } from "../model/ticket.model.js"; // 🔥 para "mis pedidos"

/* ============================================================
   TWILIO (WhatsApp Opcional)
============================================================ */
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const WHATSAPP_FROM = process.env.WHATSAPP_FROM;

let client = null;
if (TWILIO_SID && TWILIO_TOKEN) {
  client = twilio(TWILIO_SID, TWILIO_TOKEN);
}

/* ============================================================
   MEMORIA AVANZADA (estilo ChatGPT)
============================================================ */
const memory = new Map(); // userKey → [{ q, a, booksResult, ts }]

function getKey(userId, via = "web", phone = null) {
  if (via === "whatsapp" && phone) return `whatsapp:${phone}`;
  if (userId) return `user:${userId}`;
  return "anon";
}

function addMemory(key, q, a, booksResult = null) {
  const prev = memory.get(key) || [];
  prev.push({ q, a, booksResult, ts: Date.now() });
  if (prev.length > 10) prev.shift();
  memory.set(key, prev);
}

function getHistory(key) {
  return memory.get(key) || [];
}

/* ============================================================
   HELPERS DE TEXTO
============================================================ */
function clean(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeReg(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractTerms(q) {
  const stop = [
    "tenes","tenés","tienen","hay","el","la","los","las",
    "un","una","libro","libros","buscar","busco","quiero",
    "mostrar","mostrame","saga","tomo","de","del","en","lo"
  ];
  return clean(q)
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.includes(w));
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ============================================================
   BÚSQUEDA DE LIBROS + CONTEXTO ("ese libro")
============================================================ */
async function searchBooks(question, history) {

  // 👉 Referencia contextual
  if (/ese|esa|ese libro|el anterior|ese mismo|ese que dijiste/.test(clean(question))) {
    const recent = [...history].reverse().find(h => h.booksResult);
    if (recent) return recent.booksResult;
  }

  const terms = extractTerms(question);
  const mainTerm = terms.join(" ") || question;

  const regex = new RegExp(escapeReg(mainTerm), "i");

  const products = await ProductModel.find({
    $or: [
      { nombre: regex },
      { descripcion: regex },
      { categoria: regex },
      { autor: regex },
    ],
  })
    .lean()
    .limit(8);

  return products;
}

function booksAnswer(books) {
  return `
📚 **Encontré estos libros relacionados:**  

${books
  .map(
    (b) => `### 📘 *${b.nombre}*
- **Categoría:** ${b.categoria || "N/A"}
- **Precio:** ${formatPrice(b.precio)}
- **Stock:** ${b.stock > 0 ? `${b.stock} disponibles` : "Sin stock"}

`
  )
  .join("\n")}
Si querés comprar alguno, buscá el título arriba en *Libros* 😉`;
}

/* ============================================================
   INTENTS MEJORADOS
============================================================ */
function detectIntent(q) {
  const s = clean(q);

  // SALUDO
  if (/hola|buenas|que tal|como estas|saludos/.test(s)) {
    return (
      "👋 ¡Hola! Soy **Libby**, tu asistente virtual.\n\n" +
      "Puedo ayudarte con:\n" +
      "• Catálogo de libros\n" +
      "• Recomendaciones\n" +
      "• Envíos 🚚\n" +
      "• Pagos 💳\n" +
      "• Devoluciones ♻️\n" +
      "• Problemas con pedidos 📦\n\n" +
      "¿Qué querés saber?"
    );
  }

  // ENVÍOS
  if (/envio|llega|demora|entrega|cuanto tarda/.test(s)) {
    return (
      "🚚 **Envíos en THE LIBRARY**\n\n" +
      "• Envíos a toda la Argentina 🇦🇷\n" +
      "• Tiempo estimado: 2 a 7 días hábiles\n" +
      "• Costos visibles en el checkout\n\n" +
      "¿A qué provincia querés enviar?"
    );
  }

  // PAGOS
  if (/pago|tarjeta|cuotas|mercado pago|credito|debito/.test(s)) {
    return (
      "💳 **Medios de pago aceptados**\n\n" +
      "• Crédito\n" +
      "• Débito\n" +
      "• Mercado Pago\n" +
      "• Promos bancarias del día\n\n" +
      "¿Querés saber si una tarjeta funciona?"
    );
  }

  // DEVOLUCIONES
  if (/devolucion|cambio|reembolso|garantia/.test(s)) {
    return (
      "♻️ **Devoluciones / Cambios**\n\n" +
      "• 10 días desde la entrega\n" +
      "• Todo se gestiona desde tu sección *Mis Compras*\n" +
      "• Si el libro llegó dañado, lo reemplazamos sin costo\n\n" +
      "¿Tuviste algún problema con un pedido?"
    );
  }

  return null;
}

/* ============================================================
   FAQs vía FUSE
============================================================ */
async function faqAnswer(question) {
  const faqs = await FaqModel.find().lean();
  if (!faqs.length) return null;

  const fuse = new Fuse(faqs, {
    keys: ["question", "tags"],
    threshold: 0.35,
    minMatchCharLength: 3,
  });

  const match = fuse.search(question);
  return match.length ? match[0].item.answer : null;
}

/* ============================================================
   "MIS PEDIDOS" — conexión real al backend
============================================================ */
export async function getOrdersForUser(userId) {
  if (!userId) return [];

  const tickets = await TicketModel.find({ purchaser: userId })
    .sort({ purchase_datetime: -1 })
    .limit(5)
    .lean();

  return tickets.map((t) => ({
    code: t.code,
    amount: t.amount,
    date: t.purchase_datetime,
  }));
}

/* ============================================================
   RESPUESTA PRINCIPAL
============================================================ */
export async function getAnswer(question, userId = null, via = "web", phone = null) {
  const q = question.trim();
  if (!q) return "Necesito que me escribas una consulta 🙂";

  const key = getKey(userId, via, phone);
  const history = getHistory(key);

  let answer = null;

  /* 1 — Intent */
  answer = detectIntent(q);

  /* 2 — Pregunta sobre libros */
  const bookLike = /(libro|libros|autor|novela|saga|cuento|tomo|edicion)/.test(clean(q));
  if (!answer || bookLike) {
    const books = await searchBooks(q, history);
    if (books.length) {
      answer = booksAnswer(books);
      addMemory(key, q, answer, books);
      await ChatLogModel.create({ userId, question: q, answer, via });
      return answer;
    }
  }

  /* 3 — "Mis pedidos" */
  if (/mis pedidos|mis compras|mis ordenes|ultimo pedido/.test(clean(q))) {
    const orders = await getOrdersForUser(userId);

    if (!orders.length) {
      answer =
        "📦 Todavía no tenés pedidos registrados en tu cuenta.\n\n¿Querés que te muestre cómo comprar?";
    } else {
      answer = `
📦 **Tus últimos pedidos:**  

${orders
  .map(
    (o) =>
      `### Pedido #${o.code}
- Total: **$${o.amount}**
- Fecha: **${new Date(o.date).toLocaleDateString("es-AR")}**`
  )
  .join("\n\n")}
      `;
    }
  }

  /* 4 — FAQs */
  if (!answer) {
    const faq = await faqAnswer(q);
    if (faq) answer = faq;
  }

  /* 5 — Fallback */
  if (!answer) {
    answer =
      "Todavía no tengo una respuesta exacta 🤖.\n" +
      "¿Querés intentarlo de otra forma?\n\n" +
      "Ejemplos:\n" +
      "• “Recomendame un libro de terror”\n" +
      "• “Qué envío hay a Mendoza”";
  }

  addMemory(key, q, answer);

  await ChatLogModel.create({
    userId,
    question: q,
    answer,
    via,
  });

  return answer;
}

/* ============================================================
   WhatsApp
============================================================ */
export async function sendWhatsAppMessage(to, msg) {
  if (!client) throw new Error("Twilio no está configurado");

  const answer = await getAnswer(msg, null, "whatsapp", to);

  const message = await client.messages.create({
    from: `whatsapp:${WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body: answer,
  });

  return { sid: message.sid, answer };
}

/* ============================================================
   CRUD de FAQs
============================================================ */
export async function createFaq({ question, answer, tags }) {
  return await FaqModel.create({ question, answer, tags });
}

export async function listFaq() {
  return await FaqModel.find().sort({ question: 1 }).lean();
}

export async function deleteFaq(id) {
  await FaqModel.findByIdAndDelete(id);
  return { success: true };
}






