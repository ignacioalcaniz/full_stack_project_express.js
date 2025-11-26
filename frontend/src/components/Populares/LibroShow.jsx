import { Link } from "react-router-dom";
import "./LibroShow.css";

export const LibroShow = ({ libro }) => {
  if (!libro) return null;

  const {
    _id,
    nombre,
    descripcion,
    imagen,
    precio,
    categoria,
    stock,
  } = libro;

  const stockLabel =
    stock === 0 ? "Sin stock" : stock <= 5 ? "Pocas unidades" : "Disponible";

  return (
    <article className="card-libro">
      <Link to={`/tienda/libros/${_id}`}>
        <div className="card-libro__imagen-wrapper">
          <img
            src={imagen}
            alt={nombre}
            className="card-libro__imagen"
          />
        </div>
      </Link>

      <div className="card-libro__contenido">
        <h3 className="card-libro__titulo">{nombre}</h3>

        {categoria && (
          <span className="card-libro__categoria">
            {categoria}
          </span>
        )}

        <p className="card-libro__descripcion">
          {descripcion}
        </p>

        <div className="card-libro__footer">
          <div>
            <p className="card-libro__precio">
              ${precio?.toLocaleString("es-AR")}
            </p>
            <span
              className={`card-libro__stock ${
                stock === 0 ? "sin-stock" : "con-stock"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          <Link
            to={`/tienda/libros/${_id}`}
            className="card-libro__boton"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
};
