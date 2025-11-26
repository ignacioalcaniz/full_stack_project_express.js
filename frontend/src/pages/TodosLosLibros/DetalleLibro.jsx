import "./DetalleLibro.css";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";

export const DetalleLibro = () => {
  const { id } = useParams();
  const { product, fetchProductById, loading } = useProductsStore();

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="animate-pulse text-xl font-semibold text-blue-700">
          Cargando información del producto...
        </div>
      </div>
    );
  }

  const stockLabel =
    product.stock > 10
      ? "Disponible"
      : product.stock > 0
      ? "Últimas unidades"
      : "Sin stock";

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/tienda" className="hover:underline">Inicio</Link> /
        <Link to="/tienda/libros" className="hover:underline"> Libros</Link> /
        <span className="text-blue-700 font-semibold">
          {" "}{product.nombre}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

        {/* Imagen */}
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            <img
              src={product.imagen}
              alt={product.nombre}
              className="rounded-2xl w-[420px] h-[550px] object-cover"
            />
          </div>
        </div>

        {/* Datos */}
        <div className="space-y-6">

          <span className="badge-categoria">
            {product.categoria}
          </span>

          <h1 className="text-4xl font-bold text-blue-900">
            {product.nombre}
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            {product.descripcion}
          </p>

          <div className="flex items-center gap-6">
            <p className="text-4xl font-extrabold text-blue-700">
              ${product.precio.toLocaleString("es-AR")}
            </p>
            <span
              className={`stock-label ${
                product.stock === 0 ? "sin-stock" : "con-stock"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-5 mt-8">
            <button
              disabled={product.stock === 0}
              className="btn-primary"
            >
              🛒 Agregar al carrito
            </button>

            <button
              disabled={product.stock === 0}
              className="btn-outline"
            >
              ⚡ Comprar ahora
            </button>
          </div>

          {/* Info adicional */}
          <div className="info-secundaria">
            <p>📦 Envío rápido y seguro</p>
            <p>🔐 Compra protegida</p>
            <p>⭐ Garantía de calidad</p>
          </div>

        </div>
      </div>
    </section>
  );
};




