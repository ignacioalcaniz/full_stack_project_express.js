import "./Categorias.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "../../components/Loader/Loader";
import { useProductsStore } from "../../store/useProductsStore";
import { motion } from "framer-motion";

export const Categorias = () => {
  const { products, fetchProducts, loading } = useProductsStore();

  useEffect(() => {
    document.title = "Catálogo - THE LIBRARY";
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <Loader />;

  return (
    <main className="p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        📚 Catálogo de Libros
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((libro) => (
          <motion.div
            key={libro._id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between"
          >
            <img
              src={libro.imagen}
              alt={libro.nombre}
              className="h-60 object-cover rounded mb-4"
            />

            <div>
              <h3 className="font-semibold text-lg">
                {libro.nombre}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {libro.descripcion}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-xl font-bold text-green-700">
                ${libro.precio.toLocaleString("es-AR")}
              </p>
              <span className="text-sm text-gray-500">
                Stock: {libro.stock}
              </span>
            </div>

            <Link
              to={`/tienda/libros/${libro._id}`}
              className="mt-4 bg-black text-white text-center py-2 rounded hover:bg-gray-800 transition"
            >
              Ver detalle
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
};


