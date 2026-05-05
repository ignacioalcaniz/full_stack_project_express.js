// src/components/ChatBot/ChatbotButton.jsx
import "./Chatbot.css";

export const ChatbotButton = ({ open, setOpen }) => (
  <button
    className="chatbot-btn"
    onClick={() => setOpen(!open)}
    aria-label="Abrir chatbot"
  >
    {!open ? (
      <div className="libby-icon">
        <svg width="44" height="44" viewBox="0 0 100 100">
          {/* Libro */}
          <rect x="20" y="20" width="60" height="60" rx="10" fill="#004AAD" />
          <rect x="25" y="25" width="50" height="50" rx="8" fill="#1976D2" />

          {/* Ojos */}
          <circle className="eye" cx="42" cy="52" r="6" fill="white" />
          <circle className="eye-right" cx="60" cy="52" r="6" fill="white" />

          <circle cx="42" cy="52" r="3" fill="#004AAD" />
          <circle cx="60" cy="52" r="3" fill="#004AAD" />

          {/* Sonrisa */}
          <path d="M40 65 Q50 74 60 65" stroke="white" strokeWidth="4" strokeLinecap="round" />

          {/* Brazos */}
          <line x1="20" y1="50" x2="5" y2="55" stroke="#004AAD" strokeWidth="4" strokeLinecap="round" />
          <line x1="80" y1="50" x2="95" y2="55" stroke="#004AAD" strokeWidth="4" strokeLinecap="round" />

          {/* Patitas */}
          <line x1="40" y1="80" x2="38" y2="95" stroke="#004AAD" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="80" x2="62" y2="95" stroke="#004AAD" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    ) : (
      <span className="chatbot-close">✕</span>
    )}
  </button>
);








