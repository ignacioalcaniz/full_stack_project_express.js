// src/pages/Admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "./components/AdminUI.css";

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const linkClass = ({ isActive }) => `admin-navlink ${isActive ? "active" : ""}`;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = `${(user?.first_name?.[0] || "A")}${(user?.last_name?.[0] || "")}`.toUpperCase();

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate("/admin")} role="button" tabIndex={0}>
          <div className="admin-brand-logo">📚</div>
          <div style={{ minWidth: 0 }}>
            <div className="admin-brand-title">THE LIBRARY</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={linkClass}>
            <span className="admin-ico">📊</span> Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            <span className="admin-ico">👤</span> Usuarios
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            <span className="admin-ico">🛒</span> Productos
          </NavLink>

          <NavLink to="/admin/tickets" className={linkClass}>
            <span className="admin-ico">🎫</span> Tickets
          </NavLink>

          <NavLink to="/admin/logs" className={linkClass}>
            <span className="admin-ico">🧾</span> Logs
          </NavLink>

          <NavLink to="/admin/settings" className={linkClass}>
            <span className="admin-ico">⚙️</span> Settings
          </NavLink>

          <NavLink to="/admin/chatbot" className={linkClass}>
            <span className="admin-ico">🤖</span> Chatbot
          </NavLink>

          <div className="admin-nav-sep" />

          <button className="admin-navbtn" onClick={() => navigate("/tienda")}>
            🏬 Volver a tienda
          </button>

          <button className="admin-navbtn danger" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-mini-user">
            <div className="admin-mini-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="truncate admin-mini-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="admin-mini-meta">
                <span className="pill ok">rol: {user?.role || "admin"}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-title">Panel de administración</div>
            <div className="admin-topbar-hint">Operación, catálogo, ventas, auditoría y chatbot</div>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-btn secondary" onClick={() => navigate("/tienda")}>
              Ir a tienda
            </button>
            <span className="pill ok">{user?.role || "admin"}</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

