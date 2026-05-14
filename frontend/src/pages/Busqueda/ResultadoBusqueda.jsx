import { useParams } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { useEffect, useMemo } from "react";
import { BookCard } from "../../components/BookCard/BookCard";
import { useProductsLive } from "../../hooks/useProductsLive";
import "./ResultadoBusqueda.css";

export const ResultadoBusqueda = () => {
  const { termino } = useParams();
  const { products, fetchProductsQuery, loading } = useProductsStore();
  const refreshKey = useProductsLive();

  useEffect(() => {
    fetchProductsQuery({
      q: termino,
      limit: 24,
    });
  }, [termino, fetchProductsQuery]);

  useEffect(() => {
    fetchProductsQuery({
      q: termino,
      limit: 24,
    });
  }, [refreshKey]);

  const principal = products[0];

  const similares = useMemo(() => {
    if (!principal) return [];

    const baseCategoria = principal.categoria;
    const baseAutor = principal.autor;
    const baseTags = principal.tags || [];

    return products.filter((p) => {
      if (p._id === principal._id) return false;
      if (baseAutor && p.autor === baseAutor) return true;
      if (baseCategoria && p.categoria === baseCategoria) return true;
      if (baseTags.length && (p.tags || []).some((t) => baseTags.includes(t))) return true;
      return false;
    });
  }, [products, principal]);

  if (loading) return <p className="resultado-loading">Cargando resultados…</p>;

  if (!products.length) {
    return <p className="resultado-empty">No se encontraron resultados.</p>;
  }

  return (
    <main className="resultado-container">
      <h2 className="resultado-title">
        Resultados para: <span>“{termino}”</span>
      </h2>

      <div className="resultado-grid">
        {products.map((libro) => (
          <BookCard key={libro._id} libro={libro} />
        ))}
      </div>

      {similares.length > 0 && (
        <>
          <h3 className="resultado-subtitle">Libros relacionados</h3>

          <div className="resultado-grid compact">
            {similares.slice(0, 8).map((libro) => (
              <BookCard key={libro._id} libro={libro} compact />
            ))}
          </div>
        </>
      )}
    </main>
  );
};




