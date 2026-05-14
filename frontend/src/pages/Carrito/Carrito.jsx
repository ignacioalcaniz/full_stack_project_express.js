import { useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import "./Carrito.css";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

export const Carrito = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    cart,
    loading,
    fetchCart,
    updateQuantity,
    removeProduct,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    if (user?.cart) fetchCart();
  }, [user, fetchCart]);

  const items = useMemo(() => {
    const list = cart?.products || [];
    return list
      .map((it) => {
        const p = it.product;
        if (!p) return null;
        return {
          prodId: p._id,
          nombre: p.nombre,
          imagen: p.imagen,
          precio: Number(p.precio || 0),
          stock: Number(p.stock || 0),
          quantity: Number(it.quantity || 1),
        };
      })
      .filter(Boolean);
  }, [cart]);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.quantity, 0),
    [items]
  );

  const total = subtotal;

  const handleClear = async () => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Vaciar carrito",
        text: "Se eliminarán todos los productos del carrito.",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      await clearCart(cart._id);

      Swal.fire({
        icon: "success",
        title: "Carrito vaciado",
        text: "Tu carrito quedó vacío correctamente.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "No pudimos vaciar el carrito",
        text: e?.response?.data?.error || e.message || "Error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const goCheckout = () => {
    navigate("/tienda/checkout");
  };

  if (!cart) return <p className="cart-loading">Cargando carrito...</p>;

  return (
    <main className="cart-page">
      <div className="cart-header">
        <h2>🛒 Tu carrito</h2>
        <Link to="/tienda/libros" className="cart-back">
          Seguir comprando
        </Link>
      </div>

      {items.length === 0 ? (
        <section className="cart-empty">
          <h3>Tu carrito está vacío</h3>
          <p>Sumá libros y volvé acá para finalizar la compra.</p>
          <Link to="/tienda/libros" className="cart-primary">
            Explorar libros
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-list">
            {items.map((it) => {
              const itemSubtotal = it.precio * it.quantity;

              return (
                <article key={it.prodId} className="cart-item">
                  <div className="cart-item-img">
                    <img src={it.imagen} alt={it.nombre} />
                  </div>

                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{it.nombre}</h4>
                    <p className="cart-item-price">
                      ${it.precio.toLocaleString("es-AR")}
                    </p>

                    <div className="cart-qty">
                      <button
                        className="qty-btn"
                        disabled={loading || it.quantity <= 1}
                        onClick={() =>
                          updateQuantity(cart._id, it.prodId, it.quantity - 1)
                        }
                        aria-label="Disminuir"
                      >
                        −
                      </button>

                      <span className="qty-value">{it.quantity}</span>

                      <button
                        className="qty-btn"
                        disabled={
                          loading || (it.stock > 0 && it.quantity >= it.stock)
                        }
                        onClick={() =>
                          updateQuantity(cart._id, it.prodId, it.quantity + 1)
                        }
                        aria-label="Aumentar"
                      >
                        +
                      </button>

                      {it.stock > 0 && (
                        <span className="qty-stock">Stock: {it.stock}</span>
                      )}
                    </div>

                    <div className="cart-item-actions">
                      <button
                        className="cart-link-danger"
                        disabled={loading}
                        onClick={() => removeProduct(cart._id, it.prodId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-subtotal">
                    <span>Subtotal</span>
                    <strong>${itemSubtotal.toLocaleString("es-AR")}</strong>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h3>Resumen</h3>

            <div className="sum-row">
              <span>Productos</span>
              <strong>${subtotal.toLocaleString("es-AR")}</strong>
            </div>

            <div className="sum-row">
              <span>Envío</span>
              <strong>Gratis</strong>
            </div>

            <div className="sum-total">
              <span>Total</span>
              <strong>${total.toLocaleString("es-AR")}</strong>
            </div>

            <button
              className="cart-primary"
              disabled={loading || items.length === 0}
              onClick={goCheckout}
            >
              Ir a pagar
            </button>

            <button
              className="cart-outline"
              disabled={loading}
              onClick={handleClear}
            >
              Vaciar carrito
            </button>

            <p className="cart-safe">
              🔒 Compra protegida • 📧 Ticket por email • ✅ Checkout seguro
            </p>
          </aside>
        </section>
      )}
    </main>
  );
};



