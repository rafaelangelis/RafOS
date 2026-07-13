import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { UsuarioFormPage } from "@/pages/usuarios/UsuarioFormPage";
import { UsuariosListPage } from "@/pages/usuarios/UsuariosListPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          {
            element: <ProtectedRoute roles={["admin"]} />,
            children: [
              { path: "/usuarios", element: <UsuariosListPage /> },
              { path: "/usuarios/novo", element: <UsuarioFormPage /> },
              { path: "/usuarios/:id", element: <UsuarioFormPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
