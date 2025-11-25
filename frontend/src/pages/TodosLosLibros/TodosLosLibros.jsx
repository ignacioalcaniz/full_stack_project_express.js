import { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { Link } from "react-router-dom";
import "./TodosLosLibros.css";

export default function TodosLosLibros() {
  const { products, fetchProducts, loading } = useProductStore();

  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [orden, setOrden] = useState("default");

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoriasUnicas = [
    "todas",
    ...new Set(products.map(p => p.categoria))
  ];

  const filteredProducts = products
    .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .filter(p => categoria === "todas" ? true : p.categoria === categoria)
    .sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      return 0;
    });

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 p-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-72 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-8">
      <h2 className="titulo-seccion">Catálogo de Libros</h2>

      {/* Barra filtros */}
      <div className="filtro-barra">
        <input
          type="text"
          placeholder="Buscar libro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select onChange={e => setCategoria(e.target.value)}>
          {categoriasUnicas.map(cat => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>

        <select onChange={e => setOrden(e.target.value)}>
          <option value="default">Ordenar</option>
          <option value="precio-asc">Precio ⬆</option>
          <option value="precio-desc">Precio ⬇</option>
        </select>
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(prod => (
          <Link to={`/TheLibrary/OtroLibros/${prod._id}`} key={prod._id}>
            <div className="bg-white shadow-xl p-4 rounded-2xl hover:scale-105 transition duration-300">
              <img
                src={prod.imagen}
                alt={prod.nombre}
                className="h-60 w-full object-cover rounded-xl"
              />

              <h3 className="text-lg font-semibold mt-3 text-blue-900">
                {prod.nombre}
              </h3>

              <p className="text-gray-500">{prod.categoria}</p>

              <p className="text-xl font-bold text-blue-600 mt-2">
                ${prod.precio}
              </p>

              <button className="boton-info w-full mt-3">
                Ver detalle
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}



