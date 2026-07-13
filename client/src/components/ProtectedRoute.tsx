import { Navigate, Outlet } from "react-router-dom";
import { type Role, useAuth } from "@/features/auth/AuthContext";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
