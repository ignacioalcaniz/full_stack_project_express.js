import { useRef, useEffect, useState } from "react";
import "./ChatbotWidget.css";
import axiosClient from "../../api/axiosClient";
import ReactMarkdown from "react-markdown";

export const ChatbotWidget = ({
  open,
  setOpen,
  messages,
  setMessages,
  loading,
  setLoading,
}) => {
  const chatEndRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  /* =======================================================
     AUTOSCROLL
  ========================================================== */
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  }, [messages, loading]);

  /* =======================================================
     CARGAR SUGERENCIAS DEL BACKEND
  ========================================================== */
  const loadSuggestions = async () => {
    try {
      const { data } = await axiosClient.get("/chatbot/suggestions");
      // suggestions NO usa createResponse, devuelve { items: [...] }
      setSuggestions(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("Error cargando sugerencias:", err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (open) loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* =======================================================
     ENVIAR MENSAJE
  ========================================================== */
  const sendMessage = async () => {
    const inputEl = document.getElementById("chatbot-input");
    const text = inputEl?.value?.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    inputEl.value = "";
    setLoading(true);

    try {
      const res = await axiosClient.post("/chatbot/ask", {
        question: text,
        via: "web",
      });

      // ✅ Soporta ambos formatos:
      // 1) createResponse => { data: { answer } }
      // 2) respuesta plana => { answer }
      const payload = res.data?.data ?? res.data ?? {};
      const answer =
        payload?.answer ||
        payload?.response ||
        (typeof payload === "string" ? payload : null);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: answer || "No pude procesar la consulta 🤖",
        },
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Ocurrió un error, probá más tarde 🙏 (${msg})`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const enter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  /* =======================================================
     CLICK EN UNA SUGERENCIA
  ========================================================== */
  const handleSuggestionClick = (text) => {
    const inputEl = document.getElementById("chatbot-input");
    if (!inputEl) return;
    inputEl.value = text;
    setTimeout(() => sendMessage(), 120);
  };

  if (!open) return null;

  return (
    <div className="chatbot-modal">
      <div className="chatbot-window">
        {/* HEADER */}
        <div className="chatbot-header">
          <span>📘 Libby — Asistente Virtual</span>
        </div>

        {/* SUGERENCIAS */}
        <div className="chatbot-suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>

        {/* MENSAJES */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${
                msg.sender === "user" ? "user-msg" : "bot-msg"
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="chat-msg bot-msg loading-bubble">
              ⏳ Libby está pensando...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="chatbot-input-box">
          <input
            id="chatbot-input"
            placeholder="Escribí tu consulta..."
            onKeyDown={enter}
            autoFocus
          />
          <button onClick={sendMessage} type="button">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};










