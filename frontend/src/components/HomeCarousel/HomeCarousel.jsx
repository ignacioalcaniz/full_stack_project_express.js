import { useEffect, useState } from "react";
import "./HomeCarousel.css";

// Slides con imagen + texto tipo MercadoLibre
const slides = [
  {
    img: "https://i.ibb.co/9HLVLZ95/OIP.jpg",
    tag: "🔥 OFERTAS DEL DÍA",
    title: "Descuentos en best sellers y sagas completas",
    subtitle: "Aprovechá precios especiales por tiempo limitado."
  },
  {
    img: "https://i.ibb.co/8DsZLh5v/OIP.jpg",
    tag: "💳 MEDIOS DE PAGO",
    title: "Pagá en cuotas con tarjeta o billetera virtual",
    subtitle: "Transacciones protegidas y procesadas de forma segura."
  },
  {
    img: "https://i.ibb.co/XZtC2bdt/OIP.jpg",
    tag: "📚 NUEVOS INGRESOS",
    title: "Los últimos lanzamientos editoriales",
    subtitle: "Encontrá las novedades antes que nadie."
  },
  {
    img: "https://i.ibb.co/rW8dt6h/OIP.jpg",
    tag: "🚚 ENVÍOS A TODO EL PAÍS",
    title: "Recibí tus libros donde estés",
    subtitle: "Envíos rápidos y seguimiento de tus pedidos."
  },
];

export const HomeCarousel = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const intervalo = setInterval(next, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="carousel-full-container">
      {/* Flecha izquierda */}
      <button className="carousel-arrow left" onClick={prev}>
        ❮
      </button>

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.img})` }}
        >
          <div className="carousel-overlay">
            <span className="carousel-tag">{slide.tag}</span>
            <h2 className="carousel-title">{slide.title}</h2>
            <p className="carousel-subtitle">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Flecha derecha */}
      <button className="carousel-arrow right" onClick={next}>
        ❯
      </button>

      {/* Indicadores */}
      <div className="carousel-indicators">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};





