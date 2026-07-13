import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { useDashboardResumo } from "@/features/dashboard/dashboard.api";
import { STATUS_LABELS, type StatusOS } from "@/features/ordens/ordens.api";
import { formatDate } from "@/lib/utils";

const STATUS_ORDER: StatusOS[] = [
  "aberta",
  "em_analise",
  "aguardando_aprovacao",
  "aguardando_peca",
  "em_conserto",
  "pronta",
  "entregue",
  "cancelada",
];

export function DashboardPage() {
  const { usuario } = useAuth();
  const { data: resumo, isLoading } = useDashboardResumo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Bem-vindo(a), {usuario?.nome}.</p>
      </div>

      {isLoading && <p className="text-slate-500">Carregando...</p>}

      {resumo && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATUS_ORDER.map((status) => (
              <Card key={status}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    {STATUS_LABELS[status]}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {resumo.porStatus[status]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="font-semibold text-slate-900">
              OS atrasadas ({resumo.atrasadas.length})
            </CardHeader>
            <CardContent>
              {resumo.atrasadas.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma OS atrasada. 🎉</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-1">OS</th>
                      <th className="py-1">Cliente</th>
                      <th className="py-1">Equipamento</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">Previsão</th>
                      <th className="py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.atrasadas.map((os) => (
                      <tr key={os.id} className="border-t border-slate-100">
                        <td className="py-2 font-medium">#{os.id}</td>
                        <td className="py-2">{os.cliente.nome}</td>
                        <td className="py-2">
                          {os.equipamento.marca} {os.equipamento.modelo}
                        </td>
                        <td className="py-2">
                          <StatusBadge status={os.status} />
                        </td>
                        <td className="py-2 text-red-600">{formatDate(os.dataPrevisao)}</td>
                        <td className="py-2 text-right">
                          <Link to={`/ordens/${os.id}`} className="text-slate-600 hover:underline">
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
