// src/pages/Inicio/Inicio.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LibrosPopulares } from "../../components/Populares/LibrosPopulares";
import { HomeCarousel } from "../../components/HomeCarousel/HomeCarousel";
import "./Inicio.css";

export const Inicio = () => {
  useEffect(() => {
    document.title = "Inicio - THE LIBRARY";
    const link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    link.rel = "icon";
    link.href = "/img/manual.ico";
    document.head.appendChild(link);
  }, []);

  return (
    <main className="home-page">
      
      {/* HERO PRINCIPAL */}
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-badge">Nuevo marketplace de libros</p>
          <h1 className="home-title">THE LIBRARY</h1>
          <p className="home-subtitle">
            Descubrí, compará y comprá libros físicos y digitales en un solo lugar.
          </p>

          <div className="home-actions">
            <Link to="/tienda/libros" className="btn-primary">
              Ver todos los libros
            </Link>
            <a href="#populares" className="btn-secondary">
              Ver libros populares
            </a>
          </div>
        </div>
      </section>

      {/* CARRUSEL PROMOCIONAL */}
      <HomeCarousel />

      {/* BLOQUE POPULARES */}
      <section id="populares" className="home-populares">
        <h2 className="home-section-title">Libros destacados</h2>
        <LibrosPopulares />
      </section>

      {/* BLOQUE VALOR DIFERENCIAL */}
      <section className="home-benefits">
        <div className="benefit-card">📦 Envíos rápidos</div>
        <div className="benefit-card">💳 Pagos seguros</div>
        <div className="benefit-card">⭐ Recomendados por lectores</div>
      </section>

    </main>
  );
};


