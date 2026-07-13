import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useClientes } from "@/features/clientes/clientes.api";
import { STATUS_LABELS, useOrdens, type StatusOS } from "@/features/ordens/ordens.api";
import { useTecnicos } from "@/features/usuarios/usuarios.api";
import { formatDate, formatMoneyFromCentavos } from "@/lib/utils";

const PAGE_SIZE = 10;

export function OrdensListPage() {
  const [status, setStatus] = useState<StatusOS | "">("");
  const [clienteId, setClienteId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const [page, setPage] = useState(1);

  const { data: clientes } = useClientes();
  const { data: tecnicos } = useTecnicos();
  const { data: ordens, isLoading } = useOrdens({
    status: status || undefined,
    clienteId: clienteId ? Number(clienteId) : undefined,
    tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
  });

  const totalPaginas = ordens ? Math.max(1, Math.ceil(ordens.length / PAGE_SIZE)) : 1;
  const ordensPagina = useMemo(
    () => ordens?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [],
    [ordens, page]
  );

  function updateFilter<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ordens de Serviço</h1>
        <Link to="/ordens/nova">
          <Button>Nova OS</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => updateFilter(setStatus)(e.target.value as StatusOS | "")}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={clienteId}
          onChange={(e) => updateFilter(setClienteId)(e.target.value)}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Todos os clientes</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={tecnicoId}
          onChange={(e) => updateFilter(setTecnicoId)(e.target.value)}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Todos os técnicos</option>
          {tecnicos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-500">Carregando...</p>}

      {ordens && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-3">OS</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Equipamento</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Técnico</th>
                  <th className="p-3">Abertura</th>
                  <th className="p-3">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {ordensPagina.map((os) => (
                  <tr key={os.id} className="border-t border-slate-100">
                    <td className="p-3 font-medium">#{os.id}</td>
                    <td className="p-3">{os.cliente.nome}</td>
                    <td className="p-3">
                      {os.equipamento.marca} {os.equipamento.modelo}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={os.status} />
                    </td>
                    <td className="p-3">{os.tecnicoResponsavel?.nome ?? "-"}</td>
                    <td className="p-3">{formatDate(os.dataAbertura)}</td>
                    <td className="p-3">{formatMoneyFromCentavos(os.valorTotalCentavos)}</td>
                    <td className="p-3 text-right">
                      <Link to={`/ordens/${os.id}`} className="text-sm text-slate-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {ordensPagina.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-3 text-center text-slate-400">
                      Nenhuma OS encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-500">
                Página {page} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                disabled={page === totalPaginas}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
