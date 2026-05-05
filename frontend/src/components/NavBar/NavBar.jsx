import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Shield } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { SearchBar } from "./SearchBar";
import "./NavBar.css";

export const Navbar = () => {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const resetCart = useCartStore((s) => s.resetCart);
  const cartInitialized = useCartStore((s) => s.initialized);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user?.cart) {
      resetCart();
      return;
    }

    if (!cartInitialized) {
      fetchCart();
    }
  }, [user?.cart, cartInitialized, fetchCart, resetCart]);

  const cartCount = useMemo(() => {
    return cart?.products?.reduce(
      (acc, item) => acc + Number(item?.quantity || 1),
      0
    ) || 0;
  }, [cart]);

  const initials = user
    ? `${(user.first_name || user.firstName || "C")[0]}${(
        user.last_name ||
        user.lastName ||
        ""
      ).charAt(0)}`.toUpperCase()
    : null;

  const isAdmin = user?.role === "admin";
  const avatarUrl = user?.avatarUrl || "";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      resetCart();
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-main">
          <Link to="/tienda" className="navbar-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">THE LIBRARY</span>
          </Link>

          <div className="navbar-search-wrapper">
            <SearchBar />
          </div>

          <div className="navbar-right">
            {isAdmin && (
              <button
                type="button"
                className="admin-pill"
                onClick={() => navigate("/admin")}
                title="Panel de administración"
              >
                <Shield size={16} />
                <span>Panel Admin</span>
              </button>
            )}

            {user ? (
              <div className="navbar-user-menu">
                <button className="user-trigger" type="button">
                  <div className="user-avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.first_name || "Usuario"}
                        className="user-avatar-image"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="user-text">
                    <span className="user-greeting">Hola</span>
                    <span className="user-name">
                      {user.first_name || "Cliente"}
                    </span>
                  </div>
                </button>

                <div className="user-dropdown">
                  <button
                    type="button"
                    onClick={() => navigate("/tienda/perfil")}
                  >
                    Mi perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/tienda/mis-compras")}
                  >
                    Mis compras
                  </button>
                  <button
                    type="button"
                    className="logout-btn"
                    onClick={() => setLogoutOpen(true)}
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar-auth-links">
                <button type="button" onClick={() => navigate("/login")}>
                  Ingresar
                </button>
                <button
                  type="button"
                  className="outlined"
                  onClick={() => navigate("/register")}
                >
                  Crear cuenta
                </button>
              </div>
            )}

            <Link to="/tienda/carrito" className="navbar-cart">
              <ShoppingCart size={22} />
              <span className="cart-label">Carrito</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <nav className="navbar-links">
          <Link to="/tienda">Inicio</Link>
          <Link to="/tienda/libros">Libros</Link>
          <Link to="/tienda/ofertas">Ofertas</Link>
          <Link to="/tienda/novedades">Novedades</Link>
        </nav>
      </header>

      {logoutOpen && (
        <div
          className="nav-logout-overlay"
          onClick={() => setLogoutOpen(false)}
        >
          <div
            className="nav-logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>¿Cerrar sesión?</h3>
            <p>Tu sesión actual se cerrará en este dispositivo.</p>

            <div className="nav-logout-actions">
              <button
                type="button"
                className="nav-logout-cancel"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="nav-logout-confirm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};



















