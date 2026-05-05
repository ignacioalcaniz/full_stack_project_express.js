import { useParams } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { useEffect, useMemo } from "react";
import { BookCard } from "../../components/BookCard/BookCard";
import "./CategoriaLibros.css";

/* ======================
   Utils
====================== */
const normalize = (v = "") =>
  v
    .toString()
    .toLowerCase()
    .normalize("NFD")               // saca acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")            // saca espacios
    .trim();

export const CategoriaLibros = () => {
  const { nombre } = useParams();
  const { products, fetchProducts, loading } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtrados = useMemo(() => {
  const list = Array.isArray(products) ? products : [];
  const categoriaURL = normalize(nombre);

  return list.filter(
    (libro) => normalize(libro.categoria) === categoriaURL
  );
}, [products, nombre]);

  return (
    <main className="categoria-container">
      <h2 className="categoria-title">
        Categoría: {nombre}
      </h2>

      {loading ? (
        <p>Cargando libros...</p>
      ) : filtrados.length === 0 ? (
        <p className="popular-empty">
          No hay libros en esta categoría.
        </p>
      ) : (
        <div className="categoria-grid">
          {filtrados.map((libro) => (
            <BookCard key={libro._id} libro={libro} />
          ))}
        </div>
      )}
    </main>
  );
};




