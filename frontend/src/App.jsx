// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Gracias } from "./pages/Checkout/Gracias";
import { Checkout } from "./pages/Checkout/Checkout";
import { MisCompras } from "./pages/MisCompras/MisCompras";

// Layout general
import { Layout } from "./pages/Layout/Layout";

// Inicio
import { Inicio } from "./pages/Inicio/Inicio";

// Libros
import { TodosLosLibros } from "./pages/TodosLosLibros/TodosLosLibros";
import { DetalleLibro } from "./pages/TodosLosLibros/DetalleLibro";

// Páginas
import { Destacados } from "./pages/Destacados/Destacados";
import { MasBuscados } from "./pages/MasBuscados/MasBuscados";
import { Ofertas } from "./pages/ofertas/Ofertas";
import { Novedades } from "./pages/Novedades/Novedades";

// Carrito
import { Carrito } from "./pages/Carrito/Carrito";

// Búsqueda
import { ResultadoBusqueda } from "./pages/Busqueda/ResultadoBusqueda";

// Auth
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { ForgotPassword } from "./pages/ForgotPassword/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword/ResetPassword";

// Perfil
import { Perfil } from "./pages/Perfil/Perfil";

// Categoría
import { CategoriaLibros } from "./pages/CategoriaLibros/CategoriaLibros";

// Error
import { Error as ErrorPage } from "./pages/Error/Error";

// ADMIN
import { AdminLayout } from "./pages/Admin/AdminLayout";
import { AdminRoute } from "./pages/Admin/components/AdminRoute";
import { AdminDashboard } from "./pages/Admin/pages/AdminDashboard";
import { AdminUsers } from "./pages/Admin/pages/AdminUsers";
import { AdminProducts } from "./pages/Admin/pages/AdminProducts";
import { AdminTickets } from "./pages/Admin/pages/AdminTickets";
import { AdminLogs } from "./pages/Admin/pages/AdminLogs";
import { AdminSettings } from "./pages/Admin/pages/AdminSettings";
import { AdminChatbot } from "./pages/Admin/pages/AdminChatbot";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/tienda" replace />} />

        {/* PANEL ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="chatbot" element={<AdminChatbot />} />
        </Route>

        {/* TIENDA */}
        <Route path="/tienda" element={<Layout />}>
          <Route index element={<Inicio />} />

          <Route
            path="perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />

          <Route
            path="mis-compras"
            element={
              <PrivateRoute>
                <MisCompras />
              </PrivateRoute>
            }
          />

          <Route path="ofertas" element={<Ofertas />} />
          <Route path="novedades" element={<Novedades />} />

          <Route path="libros" element={<TodosLosLibros />} />
          <Route path="libros/:id" element={<DetalleLibro />} />

          <Route path="destacados" element={<Destacados />} />
          <Route path="mas-buscados" element={<MasBuscados />} />

          <Route path="categoria/:nombre" element={<CategoriaLibros />} />

          <Route
            path="carrito"
            element={
              <PrivateRoute>
                <Carrito />
              </PrivateRoute>
            }
          />

          <Route
            path="gracias"
            element={
              <PrivateRoute>
                <Gracias />
              </PrivateRoute>
            }
          />

          <Route
            path="checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          <Route path="busqueda/:termino" element={<ResultadoBusqueda />} />
        </Route>

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Catch-all */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;














