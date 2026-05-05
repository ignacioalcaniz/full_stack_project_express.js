// src/pages/TodosLosLibros/DetalleLibro.jsx
import "./DetalleLibro.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductsStore } from "../../store/useProductsStore";
import { useCartStore } from "../../store/useCartStore";
import { toast } from "react-hot-toast";
import { BookCard } from "../../components/BookCard/BookCard";

export const DetalleLibro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { product, products, fetchProductById, fetchProducts, loading } =
    useProductsStore();

  const { addProduct } = useCartStore();

  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetchProductById(id);
    fetchProducts();
  }, [id, fetchProductById, fetchProducts]);

  /* ======================
     LIBROS SIMILARES
  ====================== */
  const similares = useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(products) ? products : [];

    const baseTags = new Set(
      (product.tags || []).map((t) => String(t).toLowerCase())
    );
    const baseAutor = (product.autor || "").toLowerCase();
    const baseCategoria = (product.categoria || "").toLowerCase();

    return list
      .filter((p) => p?._id && p._id !== product._id)
      .map((p) => {
        let score = 0;
        if ((p.categoria || "").toLowerCase() === baseCategoria) score += 6;
        if ((p.autor || "").toLowerCase() === baseAutor) score += 4;

        const tags = (p.tags || []).map((t) => String(t).toLowerCase());
        const common = tags.filter((t) => baseTags.has(t)).length;
        score += Math.min(common, 5);

        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);
  }, [product, products]);

  /* ======================
     HANDLERS
  ====================== */
  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addProduct(product._id);

      toast.success("Producto agregado al carrito 🛒", {
        style: { background: "#0f172a", color: "white" },
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Necesitás iniciar sesión", {
          style: { background: "#0f172a", color: "white" },
        });
        return navigate("/login", { state: { from: location.pathname } });
      }
      toast.error("Error al agregar el producto", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setBuying(true);

      // 1️⃣ Agrega al carrito
      await addProduct(product._id);

      // 2️⃣ Redirige al checkout (carrito)
      navigate("/tienda/carrito");
    } catch (err) {
      toast.error("Error al iniciar la compra", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setBuying(false);
    }
  };

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
      <div className="detalle-wrapper">
        <div className="detalle-img-box">
          <img
            src={product.imagen}
            alt={product.nombre}
            className="detalle-img"
          />
        </div>

        <div>
          <span className="badge-categoria">{product.categoria}</span>

          <h1 className="detalle-titulo">{product.nombre}</h1>
          <p className="detalle-desc">{product.descripcion}</p>

          <div className="detalle-precio-line">
            <p className="detalle-precio">
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

          <div className="detalle-actions">
            <button
              disabled={product.stock === 0 || adding}
              onClick={handleAddToCart}
              className="btn-primary"
            >
              {adding ? "Agregando..." : "🛒 Agregar al carrito"}
            </button>

            <button
              disabled={product.stock === 0 || buying}
              onClick={handleBuyNow}
              className="btn-outline"
            >
              {buying ? "Redirigiendo..." : "⚡ Comprar ahora"}
            </button>
          </div>

          <div className="info-secundaria">
            <p>📦 Envío rápido y seguro</p>
            <p>🔐 Compra protegida</p>
            <p>⭐ Garantía de calidad</p>
          </div>
        </div>
      </div>

      {similares.length > 0 && (
        <section className="similares-section">
          <div className="similares-header">
            <h2 className="similares-title">📚 Libros similares</h2>
            <p className="similares-subtitle">
              Basado en categoría, autor y tags.
            </p>
          </div>

          <div className="similares-grid">
            {similares.map((libro) => (
              <BookCard key={libro._id} libro={libro} compact />
            ))}
          </div>
        </section>
      )}
    </section>
  );
};












