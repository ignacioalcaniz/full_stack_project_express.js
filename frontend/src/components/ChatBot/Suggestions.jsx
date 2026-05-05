// src/components/ChatBot/Suggestions.jsx
import "./Suggestions.css";

export const Suggestions = ({ onSelect }) => {
  const items = [
    "¿Tenés Harry Potter?",
    "Recomendame un libro",
    "¿Cuánto tarda el envío?",
    "¿Puedo pagar con tarjeta?",
    "¿Dónde veo mis pedidos?",
    "Problema con una compra",
  ];

  return (
    <div className="suggestions-container">
      {items.map((s, i) => (
        <button key={i} className="suggestion-chip" onClick={() => onSelect(s)}>
          {s}
        </button>
      ))}
    </div>
  );
};
