import { LayoutDashboard, LogOut, Users, UserCog, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: undefined },
  { to: "/clientes", label: "Clientes", icon: Users, roles: undefined },
  { to: "/ordens", label: "Ordens de Serviço", icon: Wrench, roles: undefined },
  { to: "/usuarios", label: "Usuários", icon: UserCog, roles: ["admin"] as const },
];

export function Sidebar() {
  const { usuario, logout, hasRole } = useAuth();

  return (
    <aside className="flex h-screen w-56 flex-col justify-between border-r border-slate-200 bg-white">
      <div>
        <div className="p-4 text-lg font-bold text-slate-900">RafOS</div>
        <nav className="flex flex-col gap-1 px-2">
          {navItems
            .filter((item) => !item.roles || hasRole(...item.roles))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100",
                    isActive && "bg-slate-900 text-white hover:bg-slate-900"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </div>
      <div className="border-t border-slate-100 p-4">
        <p className="truncate text-sm font-medium text-slate-900">{usuario?.nome}</p>
        <p className="truncate text-xs text-slate-500">{usuario?.role}</p>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
