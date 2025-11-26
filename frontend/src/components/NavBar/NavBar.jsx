import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { useContext } from "react";
import { DatosContext } from "../../context/DatosContext";
import "./NavBar.css";

export const Navbar = () => {
  const { carrito } = useContext(DatosContext);

  return (
    <header className="navbar-container">
      {/* FILA SUPERIOR */}
      <div className="navbar-top">
        <Link to="/tienda" className="logo">
          THE LIBRARY
        </Link>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Buscar libros, autores o categorías..."
          />
          <button>
            <Search size={20} />
          </button>
        </div>

        <Link to="/tienda/carrito" className="cart-btn">
          <ShoppingCart size={26} />
          {carrito.length > 0 && (
            <span className="cart-badge">{carrito.length}</span>
          )}
        </Link>
      </div>

      {/* FILA INFERIOR */}
      <nav className="navbar-bottom">
        <Link to="/tienda">Inicio</Link>
        <Link to="/tienda/libros">Libros</Link>
        <Link to="/tienda/ofertas">Ofertas</Link>
        <Link to="/tienda/categorias">Categorías</Link>
        <Link to="/tienda/novedades">Novedades</Link>
      </nav>
    </header>
  );
};
















