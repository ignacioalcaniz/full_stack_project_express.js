import { useEffect, useMemo } from "react";
import { Loader } from "../Loader/Loader";
import { Link } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import "./LibrosPopulares.css";

export const LibrosPopulares = () => {
  const { products, fetchProducts, loading, error } = useProductsStore();

  useEffect(() => {
    console.log("✅ COMPONENTE LibrosPopulares MONTADO");
    fetchProducts();
  }, [fetchProducts]);

  const librosPopulares = useMemo(() => {
    if (!products || products.length === 0) return [];
    const copia = [...products];
    copia.sort(() => Math.random() - 0.5);
    return copia.slice(0, 4);
  }, [products]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <p className="popular-error">
        Error al cargar libros populares. Intenta nuevamente más tarde.
      </p>
    );
  }

  if (librosPopulares.length === 0) {
    return (
      <p className="popular-empty">
        No hay libros populares disponibles por el momento.
      </p>
    );
  }

  return (
    <section className="popular-section">
      <div className="popular-grid">
        {librosPopulares.map((libro) => (
          <article key={libro._id} className="popular-card">
            <div className="popular-image-wrapper">
              <img
                src={libro.imagen}
                alt={libro.nombre}
                className="popular-image"
              />
            </div>

            <div className="popular-body">
              <h3 className="popular-title">{libro.nombre}</h3>
              <p className="popular-desc">{libro.descripcion}</p>
            </div>

            <div className="popular-footer">
              <div>
                <p className="popular-price">
                  ${libro.precio.toLocaleString("es-AR")}
                </p>
                <span className="popular-stock">Stock: {libro.stock}</span>
              </div>
              <Link
                to={`/tienda/libros/${libro._id}`}
                className="popular-link"
              >
                Ver detalle
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};


