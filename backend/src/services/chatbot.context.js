// src/services/chatbot.context.js

/**
 * CONTEXTO AVANZADO DEL CHATBOT
 * Memoria multi-turno por usuario:
 * - último tema
 * - últimas preguntas
 * - intención detectada
 * - si mencionó un libro
 */

const contextStore = new Map();
// userKey → { lastIntent, lastTopic, lastBook, history }

export function getUserContext(userKey) {
  return contextStore.get(userKey) || {
    lastIntent: null,
    lastTopic: null,
    lastBook: null,
    history: [],
  };
}

export function updateUserContext(userKey, patch) {
  const ctx = getUserContext(userKey);
  const newCtx = { ...ctx, ...patch };

  // limitamos historial
  if (newCtx.history.length > 10) newCtx.history.shift();

  contextStore.set(userKey, newCtx);
  return newCtx;
}

export function pushHistory(userKey, question, answer) {
  const ctx = getUserContext(userKey);
  ctx.history.push({ question, answer, ts: new Date() });
  updateUserContext(userKey, ctx);
}
