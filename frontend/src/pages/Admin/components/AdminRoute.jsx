import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "admin") return <Navigate to="/tienda" replace />;

  return children;
}

