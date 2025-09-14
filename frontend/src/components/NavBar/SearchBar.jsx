import { useState } from "react";
import "./SearchBar.css";

export const SearchBar = ({ submit }) => {
    const [libro, setLibro] = useState(""); 

    const buscar = () => {
        submit(libro); 
    };

    const change = (event) => {
        setLibro(event.target.value);
    };
  

    return (
        <div className="BarraNavegacion">
            <input className="text-center" placeholder="Ingrese el nombre exacto del libro a buscar" value={libro} onChange={change} type="text" />
            <button className="ml-1" onClick={buscar}>
                <img className="img-busqueda" src="https://i.ibb.co/VL8WVft/lupa-1.png" alt="Buscar" />
            </button>
        </div>
    );
};