import { Link } from "react-router-dom";
import "../ProductCard/ProductCard.css";

export function BookCard({ libro }) {
  if (!libro) return null;

  return (
    <article className="popular-card">
      <div className="popular-image-wrapper">
        <img
          src={libro.imagen}
          alt={libro.nombre}
          className="popular-image"
          loading="lazy"
        />
      </div>

      <div className="popular-body">
        <h3 className="popular-title">{libro.nombre}</h3>
        {libro.autor && (
          <p className="popular-desc">{libro.autor}</p>
        )}
      </div>

      <div className="popular-footer">
        <p className="popular-price">
          ${Number(libro.precio || 0).toLocaleString("es-AR")}
        </p>

        <Link
          to={`/tienda/libros/${libro._id}`}
          className="popular-link"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
