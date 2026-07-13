import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PagamentoStatusBadge } from "@/components/PagamentoStatusBadge";
import { RegistrarPagamentoModal } from "@/components/RegistrarPagamentoModal";
import {
  baixarCsv,
  useContasAReceber,
  type ContaReceber,
  useRecebidoPeriodo,
} from "@/features/financeiro/financeiro.api";
import { formatDate, formatMoneyFromCentavos } from "@/lib/utils";

function primeiroDiaDoMes() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

function ultimoDiaDoMes() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function FinanceiroPage() {
  const [inicio, setInicio] = useState(primeiroDiaDoMes());
  const [fim, setFim] = useState(ultimoDiaDoMes());

  const { data: contasAReceber, isLoading: carregandoContas } = useContasAReceber();
  const { data: recebido, isLoading: carregandoRecebido } = useRecebidoPeriodo(inicio, fim);

  const [osSelecionada, setOsSelecionada] = useState<ContaReceber | null>(null);

  const totalAReceberCentavos = (contasAReceber ?? []).reduce(
    (acc, os) => acc + (os.saldoDevedorCentavos ?? 0),
    0
  );

  async function exportar() {
    await baixarCsv(inicio, fim);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="inicio">De</Label>
          <Input id="inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="fim">Até</Label>
          <Input id="fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <Button variant="outline" onClick={exportar}>
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-slate-500">A receber (total)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatMoneyFromCentavos(totalAReceberCentavos)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Recebido no período</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {carregandoRecebido ? "..." : formatMoneyFromCentavos(recebido?.totalCentavos ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase text-slate-500">
              Por forma de pagamento
            </p>
            {recebido && Object.keys(recebido.porFormaPagamento).length > 0 ? (
              <ul className="text-sm">
                {Object.entries(recebido.porFormaPagamento).map(([forma, valor]) => (
                  <li key={forma} className="flex justify-between">
                    <span className="capitalize text-slate-600">{forma}</span>
                    <span className="font-medium text-slate-900">
                      {formatMoneyFromCentavos(valor)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Sem recebimentos no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="font-semibold text-slate-900">
          Contas a receber {contasAReceber && `(${contasAReceber.length})`}
        </CardHeader>
        <CardContent>
          {carregandoContas && <p className="text-slate-500">Carregando...</p>}

          {contasAReceber && contasAReceber.length === 0 && (
            <p className="text-sm text-slate-400">Nenhuma conta pendente. 🎉</p>
          )}

          {contasAReceber && contasAReceber.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-1">OS</th>
                  <th className="py-1">Cliente</th>
                  <th className="py-1">Total</th>
                  <th className="py-1">Pago</th>
                  <th className="py-1">Saldo</th>
                  <th className="py-1">Situação</th>
                  <th className="py-1">Previsão</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {contasAReceber.map((os) => (
                  <tr key={os.id} className="border-t border-slate-100">
                    <td className="py-2 font-medium">#{os.id}</td>
                    <td className="py-2">{os.cliente.nome}</td>
                    <td className="py-2">{formatMoneyFromCentavos(os.valorTotalCentavos)}</td>
                    <td className="py-2">{formatMoneyFromCentavos(os.valorPagoCentavos ?? 0)}</td>
                    <td className="py-2 font-medium text-red-600">
                      {formatMoneyFromCentavos(os.saldoDevedorCentavos)}
                    </td>
                    <td className="py-2">
                      {os.statusPagamento && <PagamentoStatusBadge status={os.statusPagamento} />}
                    </td>
                    <td className="py-2">{formatDate(os.dataPrevisao)}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => setOsSelecionada(os)}
                        className="mr-3 text-slate-600 hover:underline"
                      >
                        Registrar pagamento
                      </button>
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

      <RegistrarPagamentoModal
        open={!!osSelecionada}
        onClose={() => setOsSelecionada(null)}
        osId={osSelecionada?.id ?? null}
        clienteNome={osSelecionada?.cliente.nome}
        saldoDevedorCentavos={osSelecionada?.saldoDevedorCentavos}
      />
    </div>
  );
}
