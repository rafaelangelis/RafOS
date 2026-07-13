import { useAuth } from "@/features/auth/AuthContext";

export function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">Bem-vindo(a), {usuario?.nome}.</p>
    </div>
  );
}
