import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { BookCard } from "../../components/BookCard/BookCard";
import "./Novedades.css";

const nowYear = new Date().getFullYear();
const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function Novedades() {
  const { products, fetchProductsQuery, loading } = useProductsStore();

  const [categoria, setCategoria] = useState("todas");

  useEffect(() => {
    document.title = "Novedades - THE LIBRARY";
    fetchProductsQuery({ limit: 120, page: 1 });
  }, [fetchProductsQuery]);

  const categoriasUnicas = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return ["todas", ...new Set(list.map((p) => p.categoria).filter(Boolean))];
  }, [products]);

  const nuevos = useMemo(() => {
    const list = Array.isArray(products) ? products : [];

    const filtered = list
      .filter((p) => p && p._id)
      .filter((p) =>
        categoria === "todas"
          ? true
          : String(p.categoria || "").toLowerCase() === categoria.toLowerCase()
      )
      .sort((a, b) => toNum(b.anioPublicacion) - toNum(a.anioPublicacion));

    // “novedades”: los más nuevos por año (y si faltan, igual muestra)
    return filtered.slice(0, 24);
  }, [products, categoria]);

  const destacadosHoy = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    // “tendencias” mezclando rating + views si existe
    return [...list]
      .filter((p) => p && p._id)
      .sort((a, b) => {
        const sa = (b?.rating || 0) + (b?.stats?.views || 0) / 200;
        const sb = (a?.rating || 0) + (a?.stats?.views || 0) / 200;
        return sa - sb;
      })
      .slice(0, 8);
  }, [products]);

  const noticias = useMemo(
    () => [
      {
        tag: "Tendencias",
        title: "Qué están leyendo los argentinos este mes",
        excerpt:
          "Un vistazo a los géneros que más crecieron: clásicos, terror moderno y realismo mágico.",
      },
      {
        tag: "Guías",
        title: "Cómo elegir tu próxima saga de fantasía",
        excerpt:
          "De épicas medievales a fantasía urbana: tips para no errarle con la recomendación.",
      },
      {
        tag: "Ciencia Ficción",
        title: "Distopías que volvieron a ser tendencia",
        excerpt:
          "Clásicos y nuevas voces: por qué las distopías están otra vez arriba.",
      },
      {
        tag: "Autoayuda",
        title: "Hábitos y productividad: lo más buscado",
        excerpt:
          "Los libros que más se agregan al carrito cuando la gente quiere “ordenar su vida”.",
      },
      {
        tag: "Historia",
        title: "Lecturas para entender el mundo actual",
        excerpt:
          "Selección de títulos que te ayudan a poner contexto sin caer en simplismos.",
      },
      {
        tag: "Clásicos",
        title: "Relecturas: volver a los libros de siempre",
        excerpt:
          "Por qué los clásicos se mantienen como compra segura en cualquier época.",
      },
    ],
    []
  );

  const preventa = useMemo(() => {
    // “preventa” simulada: libros con año actual o muy reciente
    const list = Array.isArray(products) ? products : [];
    return list
      .filter((p) => p && p._id)
      .filter((p) => toNum(p.anioPublicacion) >= nowYear - 1)
      .slice(0, 8);
  }, [products]);

  return (
    <main className="novedades-page">
      {/* HERO */}
      <section className="nov-hero">
        <div className="nov-hero-main">
          <span className="nov-chip">🆕 Novedades</span>
          <h1>Lo nuevo, lo que se viene y lo que es tendencia</h1>
          <p>
            Lanzamientos, recomendaciones y lecturas destacadas para mantener tu biblioteca
            siempre actualizada.
          </p>

          <div className="nov-actions">
            <a href="#lanzamientos" className="nov-btn nov-primary">
              Ver lanzamientos
            </a>
            <Link to="/tienda/ofertas" className="nov-btn nov-outline">
              Ir a Ofertas
            </Link>
          </div>

          <div className="nov-filter">
            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categoriasUnicas.map((c) => (
                <option key={c} value={c}>
                  {String(c).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="nov-hero-side">
          <div className="nov-side-card">
            <h3>📌 Tendencias de hoy</h3>
            <p>Selección basada en rating y visitas.</p>
            <div className="nov-miniGrid">
              {destacadosHoy.slice(0, 4).map((b) => (
                <Link
                  key={b._id}
                  to={`/tienda/libros/${b._id}`}
                  className="nov-mini"
                >
                  <img src={b.imagen} alt={b.nombre} loading="lazy" />
                  <span>{b.nombre}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="nov-side-card alt">
            <h3>🗞️ Lecturas recomendadas</h3>
            <p>Noticias y guías para elegir mejor.</p>
            <a href="#noticias" className="nov-link">
              Ver sección de noticias →
            </a>
          </div>
        </div>
      </section>

      {/* LANZAMIENTOS */}
      <section id="lanzamientos" className="nov-section">
        <div className="nov-head">
          <h2>📚 Nuevos lanzamientos</h2>
          <p>Ordenados por año de publicación (más nuevos primero).</p>
        </div>

        {loading ? (
          <p className="nov-soft">Cargando…</p>
        ) : nuevos.length === 0 ? (
          <p className="nov-soft">No hay novedades con esa categoría.</p>
        ) : (
          <div className="nov-grid">
            {nuevos.map((libro) => (
              <BookCard key={libro._id} libro={libro} />
            ))}
          </div>
        )}
      </section>

      {/* NOTICIAS */}
      <section id="noticias" className="nov-section">
        <div className="nov-head">
          <h2>📰 Noticias & tendencias</h2>
          <p>Contenido editorial (tipo e-commerce grande).</p>
        </div>

        <div className="news-grid">
          {noticias.map((n, idx) => (
            <article key={idx} className="news-card">
              <div className="news-tag">{n.tag}</div>
              <h3>{n.title}</h3>
              <p>{n.excerpt}</p>
              <Link to="/tienda/libros" className="news-cta">
                Explorar libros →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* PREVENTA */}
      <section className="nov-section">
        <div className="nov-head">
          <h2>⏳ Preventa / recién publicados</h2>
          <p>Libros del año actual o muy reciente.</p>
        </div>

        {preventa.length === 0 ? (
          <p className="nov-soft">No hay items en preventa por ahora.</p>
        ) : (
          <div className="nov-grid compact">
            {preventa.map((libro) => (
              <BookCard key={libro._id} libro={libro} compact />
            ))}
          </div>
        )}
      </section>

   
    </main>
  );
}
