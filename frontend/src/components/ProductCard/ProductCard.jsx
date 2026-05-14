// src/components/ProductCard/ProductCard.jsx
import { useEffect, useMemo } from "react";
import { Loader } from "../Loader/Loader";
import { Link } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import "./ProductCard.css";

const asArray = (v) => (Array.isArray(v) ? v : []);

export const ProductCard = ({ mode = "random", limit = 4, showDesc = true }) => {
  const {
    products,
    featuredProducts,
    popularProducts,
    fetchProducts,
    fetchFeaturedProducts,
    fetchPopularProducts,
    loading,
    error,
  } = useProductsStore();

  useEffect(() => {
    if (mode === "featured") fetchFeaturedProducts();
    else if (mode === "popular") fetchPopularProducts();
    else fetchProducts();
  }, [mode, fetchFeaturedProducts, fetchPopularProducts, fetchProducts]);

  const source = useMemo(() => {
    if (mode === "featured") return asArray(featuredProducts);
    if (mode === "popular") return asArray(popularProducts);
    return asArray(products);
  }, [mode, products, featuredProducts, popularProducts]);

  const libros = useMemo(() => {
    if (source.length === 0) return [];

    if (mode === "random") {
      const copia = [...source];
      copia.sort(() => Math.random() - 0.5);
      return copia.slice(0, limit);
    }

    return source.slice(0, limit);
  }, [source, mode, limit]);

  if (loading && libros.length === 0) return <Loader />;

  if (error) {
    return (
      <p className="popular-error">
        Error al cargar libros. Intenta nuevamente más tarde.
      </p>
    );
  }

  if (libros.length === 0) {
    return (
      <p className="popular-empty">No hay libros disponibles por el momento.</p>
    );
  }

  return (
    <section className="popular-section">
      <div className="popular-grid">
        {libros.map((libro) => (
          <article key={libro._id} className="popular-card">
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
              {showDesc && <p className="popular-desc">{libro.descripcion}</p>}
            </div>

            <div className="popular-footer">
              <p className="popular-price">
                ${Number(libro.precio || 0).toLocaleString("es-AR")}
              </p>

              <Link to={`/tienda/libros/${libro._id}`} className="popular-link">
                Ver detalle
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};





