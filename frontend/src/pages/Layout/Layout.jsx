// src/pages/Layout/Layout.jsx
import { useState } from "react";
import { Navbar } from "../../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";
import { Footer } from "../../components/footer/Footer";

import { ChatbotWidget } from "../../components/ChatBot/ChatbotWidget";
import { ChatbotButton } from "../../components/ChatBot/ChatbotButton";

export const Layout = () => {
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "📚 ¡Hola! Soy **Libby**, tu asistente virtual.\n" +
        "Preguntame lo que necesites 🙂",
    },
  ]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <Outlet />
        <Footer />
      </div>

      <ChatbotButton open={openChat} setOpen={setOpenChat} />
      <ChatbotWidget
        open={openChat}
        setOpen={setOpenChat}
        messages={messages}
        setMessages={setMessages}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
};