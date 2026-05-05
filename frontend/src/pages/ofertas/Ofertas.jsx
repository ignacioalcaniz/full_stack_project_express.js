import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { BookCard } from "../../components/BookCard/BookCard";
import "./Ofertas.css";

/** Descuento determinístico (no cambia al recargar) */
const hashStr = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const discountFor = (p) => {
  const base = String(p?.isbn || p?._id || p?.nombre || "");
  const h = hashStr(base);
  const pct = 10 + (h % 55); // 10% - 64%
  return Math.min(Math.max(pct, 10), 65);
};

const clampMoney = (n) => {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v : 0;
};

const OfferCard = ({ libro, descuentoPct }) => {
  const precio = clampMoney(libro?.precio);
  const antes = Math.round(precio / (1 - descuentoPct / 100));
  const ahorro = Math.max(antes - precio, 0);

  return (
    <Link to={`/tienda/libros/${libro._id}`} className="offer-card">
      <div className="offer-badge">-{descuentoPct}%</div>

      <div className="offer-imgWrap">
        <img
          src={libro.imagen}
          alt={libro.nombre}
          className="offer-img"
          loading="lazy"
        />
      </div>

      <div className="offer-body">
        <h3 className="offer-title">{libro.nombre}</h3>
        <p className="offer-meta">
          {(libro.autor || "").trim() ? libro.autor : libro.categoria}
        </p>

        <div className="offer-prices">
          <span className="offer-now">
            ${precio.toLocaleString("es-AR")}
          </span>
          <span className="offer-before">
            ${antes.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="offer-extra">
          <span className="offer-save">
            Ahorrás ${ahorro.toLocaleString("es-AR")}
          </span>
          <span className="offer-cta">Ver oferta</span>
        </div>
      </div>
    </Link>
  );
};

export function Ofertas() {
  const { products, fetchProductsQuery, loading } = useProductsStore();

  // filtros “tipo marketplace”
  const [categoria, setCategoria] = useState("todas");
  const [minDesc, setMinDesc] = useState(20);
  const [modo, setModo] = useState("flash"); // flash | recomendadas | best
  const [orden, setOrden] = useState("desc-desc"); // desc-desc | price-asc | price-desc | az | za

  useEffect(() => {
    document.title = "Ofertas - THE LIBRARY";
    // traemos “mucho” para armar ofertas client-side
    fetchProductsQuery({ limit: 120, page: 1 });
  }, [fetchProductsQuery]);

  const categoriasUnicas = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const cats = list.map((p) => p.categoria).filter(Boolean);
    return ["todas", ...new Set(cats)];
  }, [products]);

  const ofertas = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const enriched = list
      .filter((p) => p && p._id && p.imagen && p.nombre)
      .map((p) => {
        const d = discountFor(p);
        return { ...p, __desc: d };
      })
      .filter((p) => p.__desc >= Number(minDesc || 0))
      .filter((p) =>
        categoria === "todas"
          ? true
          : String(p.categoria || "").toLowerCase() === categoria.toLowerCase()
      );

    // “modo” para variar secciones
    let base = enriched;
    if (modo === "best") {
      base = enriched.sort((a, b) => (b?.stats?.views || 0) - (a?.stats?.views || 0));
    } else if (modo === "recomendadas") {
      base = enriched.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
    } else {
      // flash: priorizar descuento alto
      base = enriched.sort((a, b) => b.__desc - a.__desc);
    }

    // orden final
    const byName = (a, b) => String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es");
    const byPriceAsc = (a, b) => clampMoney(a?.precio) - clampMoney(b?.precio);
    const byPriceDesc = (a, b) => clampMoney(b?.precio) - clampMoney(a?.precio);

    if (orden === "az") base = [...base].sort(byName);
    if (orden === "za") base = [...base].sort((a, b) => byName(b, a));
    if (orden === "price-asc") base = [...base].sort(byPriceAsc);
    if (orden === "price-desc") base = [...base].sort(byPriceDesc);

    return base;
  }, [products, categoria, minDesc, modo, orden]);

  const topDeals = useMemo(() => ofertas.slice(0, 16), [ofertas]);

  const carruselBookCards = useMemo(() => {
    // sección de “reutilizar BookCard” (más estándar)
    // tomamos ofertas y mostramos algunas como cards normales
    return ofertas.slice(16, 28);
  }, [ofertas]);

  return (
    <main className="ofertas-page">
      {/* HERO + BANNERS */}
      <section className="ofertas-hero">
        <div className="hero-main">
          <div className="hero-chip">🔥 Semana de Ofertas</div>
          <h1>Ofertas irresistibles en libros</h1>
          <p>
            Descuentos reales en tus categorías favoritas. Aprovechá “Flash Deals”,
            cupones y recomendaciones.
          </p>

          <div className="hero-actions">
            <a href="#flash" className="hero-btn hero-btn-primary">
              Ver Flash Deals
            </a>
            <Link to="/tienda/libros" className="hero-btn hero-btn-outline">
              Ir al catálogo
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{Math.min(ofertas.length, 999)}+</strong>
              <span>ofertas activas</span>
            </div>
            <div className="hero-stat">
              <strong>24h</strong>
              <span>de rotación</span>
            </div>
            <div className="hero-stat">
              <strong>Seguro</strong>
              <span>y profesional</span>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="banner banner-a">
            <h3>⚡ Flash Deals</h3>
            <p>Los mayores descuentos primero.</p>
            <button
              className="banner-btn"
              onClick={() => {
                setModo("flash");
                setOrden("desc-desc");
                setMinDesc(35);
                setTimeout(() => {
                  const el = document.getElementById("flash");
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              }}
            >
              Activar
            </button>
          </div>

          <div className="banner banner-b">
            <h3>🏷️ Cupones</h3>
            <p>Aplicá ahorro extra por categoría.</p>
            <a className="banner-btn" href="#cupones">
              Ver cupones
            </a>
          </div>
        </div>
      </section>

      {/* CUPONES */}
      <section id="cupones" className="ofertas-section">
        <div className="section-head">
          <h2>🎟️ Cupones rápidos</h2>
          <p>Aplicá un filtro listo para usar.</p>
        </div>

        <div className="cupones-row">
          <button className="cup" onClick={() => setMinDesc(20)}>
            -20% o más
          </button>
          <button className="cup" onClick={() => setMinDesc(35)}>
            -35% o más
          </button>
          <button className="cup" onClick={() => setMinDesc(50)}>
            -50% o más
          </button>
          <button className="cup" onClick={() => setModo("recomendadas")}>
            Recomendadas ⭐
          </button>
          <button className="cup" onClick={() => setModo("best")}>
            Más vistas 👀
          </button>
        </div>
      </section>

      {/* FILTROS */}
      <section className="ofertas-section filtros">
        <div className="section-head">
          <h2>🧰 Filtrar ofertas</h2>
          
        </div>

        <div className="filtros-bar">
          <div className="filtro">
            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categoriasUnicas.map((c) => (
                <option key={c} value={c}>
                  {String(c).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro">
            <label>Descuento mínimo</label>
            <div className="range-row">
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={minDesc}
                onChange={(e) => setMinDesc(Number(e.target.value))}
              />
              <span className="range-pill">{minDesc}%+</span>
            </div>
          </div>

          <div className="filtro">
            <label>Modo</label>
            <select value={modo} onChange={(e) => setModo(e.target.value)}>
              <option value="flash">Flash Deals</option>
              <option value="recomendadas">Recomendadas</option>
              <option value="best">Más vistas</option>
            </select>
          </div>

          <div className="filtro">
            <label>Ordenar</label>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              <option value="desc-desc">Mayor descuento</option>
              <option value="price-asc">Precio más bajo</option>
              <option value="price-desc">Precio más alto</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="filtro acciones">
            <button
              className="fbtn fbtn-outline"
              onClick={() => {
                setCategoria("todas");
                setMinDesc(20);
                setModo("flash");
                setOrden("desc-desc");
              }}
            >
              Limpiar
            </button>
            <a className="fbtn fbtn-primary" href="#flash">
              Ver ofertas
            </a>
          </div>
        </div>
      </section>

      {/* FLASH DEALS */}
      <section id="flash" className="ofertas-section">
        <div className="section-head">
          <h2>⚡ Flash Deals</h2>
          <p>Top ofertas según tus filtros.</p>
        </div>

        {loading ? (
          <p className="soft">Cargando ofertas…</p>
        ) : topDeals.length === 0 ? (
          <p className="soft">No hay ofertas con esos filtros.</p>
        ) : (
          <div className="offers-grid">
            {topDeals.map((libro) => (
              <OfferCard key={libro._id} libro={libro} descuentoPct={libro.__desc} />
            ))}
          </div>
        )}
      </section>

      {/* REUTILIZAR BOOKCARD */}
      <section className="ofertas-section">
        <div className="section-head">
          <h2>📦 Recomendadas con descuento</h2>
          <p>Formato estándar del sitio (BookCard).</p>
        </div>

        {carruselBookCards.length === 0 ? (
          <p className="soft">Sin resultados por ahora.</p>
        ) : (
          <div className="bookcards-grid">
            {carruselBookCards.map((libro) => (
              <BookCard key={libro._id} libro={libro} />
            ))}
          </div>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="ofertas-cta">
        <div className="cta-box">
          <h3>🚀 ¿Listo para comprar con descuento?</h3>
          <p>
            Sumá al carrito, comprá seguro y recibí el ticket. Esto ya está
            preparado para escalar con AWS.
          </p>
          <div className="cta-actions">
            <Link to="/tienda/libros" className="hero-btn hero-btn-primary">
              Explorar más libros
            </Link>
            <Link to="/tienda/carrito" className="hero-btn hero-btn-outline">
              Ir al carrito
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
