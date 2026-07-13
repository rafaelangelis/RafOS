import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientes } from "@/features/clientes/clientes.api";

export function ClientesListPage() {
  const [q, setQ] = useState("");
  const { data: clientes, isLoading } = useClientes(q || undefined);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <Link to="/clientes/novo">
          <Button>Novo Cliente</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-slate-500">Carregando...</p>}

      {clientes && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Email</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c.telefone}</td>
                  <td className="p-3">{c.email ?? "-"}</td>
                  <td className="p-3 text-right">
                    <Link to={`/clientes/${c.id}`} className="text-sm text-slate-600 hover:underline">
                      Ver / Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-400">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
