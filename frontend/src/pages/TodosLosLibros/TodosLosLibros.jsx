import { useEffect, useMemo, useState } from "react";
import { useProductsStore } from "../../store/useProductsStore";
import { BookCard } from "../../components/BookCard/BookCard";
import { useProductsLive } from "../../hooks/useProductsLive";
import "./TodosLosLibros.css";

export function TodosLosLibros() {
  const { products, fetchProductsQuery, loading } = useProductsStore();
  const refreshKey = useProductsLive();

  const [form, setForm] = useState({
    q: "",
    categoria: "todas",
    autor: "",
    pais: "",
    editorial: "",
    idioma: "",
    anio: "",
    soloStock: false,
    orden: "default",
  });

  const categoriasUnicas = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return ["todas", ...new Set(list.map((p) => p.categoria).filter(Boolean))];
  }, [products]);

  const buildQuery = () => ({
    q: form.q || undefined,
    categoria: form.categoria,
    autor: form.autor || undefined,
    pais: form.pais || undefined,
    editorial: form.editorial || undefined,
    idioma: form.idioma || undefined,
    anio: form.anio || undefined,
    stock: form.soloStock ? "true" : undefined,
    sort: form.orden === "default" ? undefined : form.orden,
    limit: 40,
    page: 1,
  });

  const aplicarFiltros = () => {
    fetchProductsQuery(buildQuery());
  };

  const limpiarFiltros = () => {
    const reset = {
      q: "",
      categoria: "todas",
      autor: "",
      pais: "",
      editorial: "",
      idioma: "",
      anio: "",
      soloStock: false,
      orden: "default",
    };
    setForm(reset);
    fetchProductsQuery({ limit: 40, page: 1 });
  };

  useEffect(() => {
    document.title = "Libros - THE LIBRARY";
    fetchProductsQuery({ limit: 40, page: 1 });
  }, [fetchProductsQuery]);

  useEffect(() => {
    fetchProductsQuery(buildQuery());
  }, [refreshKey]);

  return (
    <section className="libros-layout">
      <aside className="libros-sidebar">
        <h3>Filtros</h3>

        <div className="filtro-group">
          <label>Título</label>
          <input
            value={form.q}
            onChange={(e) => setForm({ ...form, q: e.target.value })}
            placeholder="Ej: Hobbit"
          />
        </div>

        <div className="filtro-group">
          <label>Autor</label>
          <input
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
          />
        </div>

        <div className="filtro-group">
          <label>País</label>
          <input
            value={form.pais}
            onChange={(e) => setForm({ ...form, pais: e.target.value })}
          />
        </div>

        <div className="filtro-group">
          <label>Editorial</label>
          <input
            value={form.editorial}
            onChange={(e) => setForm({ ...form, editorial: e.target.value })}
          />
        </div>

        <div className="filtro-group">
          <label>Idioma</label>
          <input
            value={form.idioma}
            onChange={(e) => setForm({ ...form, idioma: e.target.value })}
          />
        </div>

        <div className="filtro-group">
          <label>Año publicación</label>
          <input
            inputMode="numeric"
            value={form.anio}
            onChange={(e) => setForm({ ...form, anio: e.target.value })}
            placeholder="Ej: 1997"
          />
        </div>

        <div className="filtro-group">
          <label>Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {categoriasUnicas.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.soloStock}
            onChange={(e) => setForm({ ...form, soloStock: e.target.checked })}
          />
          Solo con stock
        </label>

        <div className="filtros-actions">
          <button onClick={aplicarFiltros} className="btn-primary">
            Aplicar filtros
          </button>
          <button onClick={limpiarFiltros} className="btn-outline">
            Limpiar
          </button>
        </div>
      </aside>

      <main className="libros-grid">
        <div className="libros-topbar">
          <h2 className="titulo-seccion">📚 Libros</h2>

          <select
            value={form.orden}
            onChange={(e) => {
              const value = e.target.value;
              const next = { ...form, orden: value };
              setForm(next);

              fetchProductsQuery({
                q: next.q || undefined,
                categoria: next.categoria,
                autor: next.autor || undefined,
                pais: next.pais || undefined,
                editorial: next.editorial || undefined,
                idioma: next.idioma || undefined,
                anio: next.anio || undefined,
                stock: next.soloStock ? "true" : undefined,
                sort: value === "default" ? undefined : value,
                limit: 40,
                page: 1,
              });
            }}
          >
            <option value="default">Ordenar</option>
            <option value="precio-desc">💰 Precio más alto</option>
            <option value="precio-asc">💸 Precio más bajo</option>
            <option value="anio-desc">📅 Más nuevos</option>
            <option value="anio-asc">📜 Más antiguos</option>
            <option value="nombre-asc">🔤 Nombre A–Z</option>
            <option value="nombre-desc">🔠 Nombre Z–A</option>
          </select>
        </div>

        {loading && (
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && products.length === 0 ? (
          <p>No se encontraron libros.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((libro) => (
              <BookCard key={libro._id} libro={libro} />
            ))}
          </div>
        )}
      </main>
    </section>
  );
}











