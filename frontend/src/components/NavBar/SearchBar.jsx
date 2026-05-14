import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

export const SearchBar = () => {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();

 const buscar = () => {
  if (texto.trim().length < 2) return;
  navigate(`/tienda/busqueda/${texto}`);
  setTexto("");
};


  return (
    <form
      className="search-wrapper"
      onSubmit={(e) => {
        e.preventDefault();
        buscar();
      }}
    >
      <input
        type="text"
        value={texto}
        placeholder="Buscar libro..."
        onChange={(e) => setTexto(e.target.value)}
      />
      <button type="submit">Buscar</button>
    </form>
  );
};



