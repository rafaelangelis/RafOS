import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClienteFormPage } from "@/pages/clientes/ClienteFormPage";
import { ClientesListPage } from "@/pages/clientes/ClientesListPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrdemDetailPage } from "@/pages/ordens/OrdemDetailPage";
import { OrdemFormPage } from "@/pages/ordens/OrdemFormPage";
import { OrdemPrintPage } from "@/pages/ordens/OrdemPrintPage";
import { OrdensListPage } from "@/pages/ordens/OrdensListPage";
import { UsuarioFormPage } from "@/pages/usuarios/UsuarioFormPage";
import { UsuariosListPage } from "@/pages/usuarios/UsuariosListPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/ordens/:id/imprimir", element: <OrdemPrintPage /> },
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/clientes", element: <ClientesListPage /> },
          { path: "/clientes/novo", element: <ClienteFormPage /> },
          { path: "/clientes/:id", element: <ClienteFormPage /> },
          { path: "/ordens", element: <OrdensListPage /> },
          { path: "/ordens/nova", element: <OrdemFormPage /> },
          { path: "/ordens/:id", element: <OrdemDetailPage /> },
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
