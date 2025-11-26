import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();

  const buscar = () => {
    if (!texto.trim()) return;

    navigate(`/tienda/busqueda/${texto}`);
    setTexto("");
  };

  return (
    <div className="search-wrapper">
      <input
        value={texto}
        placeholder="Buscar libro..."
        onChange={(e) => setTexto(e.target.value)}
      />
      <button onClick={buscar}>Buscar</button>
    </div>
  );
};

