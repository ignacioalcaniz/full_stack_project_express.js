import { useParams } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { useEffect } from "react";

export const ResultadoBusqueda = () => {
  const { termino } = useParams();
  const { products, fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtrados = products.filter(libro =>
    libro.nombre.toLowerCase().includes(termino.toLowerCase())
  );

  const principal = filtrados[0];
  const similares = products.filter(
    l => l.categoria === principal?.categoria && l._id !== principal?._id
  );

  return (
    <main className="p-6">
      <h2 className="text-3xl mb-4">Resultado para: {termino}</h2>

      {principal && (
        <>
          <h3 className="text-xl font-bold">{principal.nombre}</h3>
          <p>{principal.descripcion}</p>
          <p className="font-semibold">${principal.precio}</p>
        </>
      )}

      <h4 className="mt-6 text-lg">Libros similares:</h4>
      <div style={{ display: "flex", gap: "1rem" }}>
        {similares.map(libro => (
          <div key={libro._id}>
            <strong>{libro.nombre}</strong>
          </div>
        ))}
      </div>
    </main>
  );
};
