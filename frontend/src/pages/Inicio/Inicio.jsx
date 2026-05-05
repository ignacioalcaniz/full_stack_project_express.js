import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HomeCarousel } from "../../components/HomeCarousel/HomeCarousel";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { useProductsLive } from "../../hooks/useProductsLive";
import "./Inicio.css";

export const Inicio = () => {
  const refreshKey = useProductsLive();

  useEffect(() => {
    document.title = "Inicio - THE LIBRARY";
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero-pro">
        <div className="home-hero-content">
          <span className="home-badge-pro">Marketplace de libros</span>
          <h1 className="home-title-pro">THE LIBRARY</h1>
          <p className="home-subtitle-pro">
            Miles de libros, tecnología profesional y experiencia premium.
          </p>

          <div className="home-actions-pro">
            <Link to="/tienda/libros" className="btn-primary">
              Explorar catálogo
            </Link>
            <a href="#destacados" className="btn-secondary">
              Ver destacados
            </a>
          </div>
        </div>
      </section>

      <section className="home-carousel-section">
        <HomeCarousel />
      </section>

      <section className="home-categorias-pro">
        <h2 className="home-section-title">Categorías más populares</h2>

        <div className="categorias-pro-grid">
          <Link to="/tienda/categoria/Fantasia" className="categoria-pro-card">
            <span>📖</span>
            <h3>Fantasía</h3>
          </Link>

          <Link to="/tienda/categoria/Ciencia%20Ficcion" className="categoria-pro-card">
            <span>🚀</span>
            <h3>Ciencia Ficción</h3>
          </Link>

          <Link to="/tienda/categoria/Novela" className="categoria-pro-card">
            <span>📚</span>
            <h3>Novela</h3>
          </Link>

          <Link to="/tienda/categoria/Terror" className="categoria-pro-card">
            <span>👻</span>
            <h3>Terror</h3>
          </Link>

          <Link to="/tienda/categoria/Autoayuda" className="categoria-pro-card">
            <span>🧠</span>
            <h3>Autoayuda</h3>
          </Link>

          <Link to="/tienda/categoria/Clasico" className="categoria-pro-card">
            <span>🏛️</span>
            <h3>Clásicos</h3>
          </Link>
        </div>
      </section>

      <section id="destacados" className="home-section-extra">
        <div className="home-section-header">
          <h2 className="home-section-title">⭐ Libros destacados</h2>
          <Link to="/tienda/destacados" className="home-link-all">
            Ver todo
          </Link>
        </div>

        <ProductCard key={`featured-${refreshKey}`} mode="featured" limit={8} showDesc={true} />
      </section>

      <section className="home-section-extra">
        <div className="home-section-header">
          <h2 className="home-section-title">🔥 Los más buscados</h2>
          <Link to="/tienda/mas-buscados" className="home-link-all">
            Ver todo
          </Link>
        </div>

        <ProductCard key={`popular-${refreshKey}`} mode="popular" limit={8} showDesc={true} />
      </section>

      <section className="home-benefits-pro">
        <div className="benefit-pro-card">
          🚚 <span>Envíos a todo el país</span>
        </div>
        <div className="benefit-pro-card">
          🔒 <span>Seguridad nivel empresarial</span>
        </div>
        <div className="benefit-pro-card">
          💳 <span>Pagos protegidos</span>
        </div>
        <div className="benefit-pro-card">
          ⭐ <span>Valorado por lectores reales</span>
        </div>
      </section>

      <section className="home-trust">
        <h3>¿Por qué elegir THE LIBRARY?</h3>
        <p>
          Plataforma profesional, escalable y segura. Pensada para clientes reales
          y proyectos de alto nivel.
        </p>
      </section>
    </main>
  );
};













