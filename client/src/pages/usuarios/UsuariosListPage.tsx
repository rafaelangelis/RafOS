import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDeactivateUsuario, useUsuarios } from "@/features/usuarios/usuarios.api";

export function UsuariosListPage() {
  const { data: usuarios, isLoading } = useUsuarios();
  const deactivate = useDeactivateUsuario();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
        <Link to="/usuarios/novo">
          <Button>Novo Usuário</Button>
        </Link>
      </div>

      {isLoading && <p className="text-slate-500">Carregando...</p>}

      {usuarios && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Email</th>
                <th className="p-3">Papel</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3">{u.nome}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.ativo ? "Ativo" : "Inativo"}</td>
                  <td className="p-3 text-right">
                    <Link to={`/usuarios/${u.id}`} className="text-sm text-slate-600 hover:underline">
                      Editar
                    </Link>
                    {u.ativo && (
                      <button
                        onClick={() => deactivate.mutate(String(u.id))}
                        className="ml-3 text-sm text-red-600 hover:underline"
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
