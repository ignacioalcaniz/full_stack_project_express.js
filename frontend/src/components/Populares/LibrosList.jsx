import "./LibrosList.css";
import { LibroShow } from "./LibroShow";


export const LibrosList = ({ LibrosLocales = [], libros = [] }) => {
  const data = LibrosLocales.length ? LibrosLocales : libros;

  if (!data || data.length === 0) {
    return (
      <p className="libros-empty">
        No hay libros disponibles por el momento.
      </p>
    );
  }

  return (
    <section className="libros-grid">
      {data.map((libro) => (
        <LibroShow key={libro._id} libro={libro} />
      ))}
    </section>
  );
};
