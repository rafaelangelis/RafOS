import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, useOrdem } from "@/features/ordens/ordens.api";
import { formatDate, formatMoneyFromCentavos } from "@/lib/utils";

export function OrdemPrintPage() {
  const { id } = useParams();
  const { data: os } = useOrdem(id);

  if (!os) return <p className="p-8 text-center text-slate-500">Carregando...</p>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
        <Button onClick={() => window.print()}>Imprimir</Button>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 p-6 text-sm print:border-0">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900">RafOS — Ordem de Serviço #{os.id}</h1>
          <span>{STATUS_LABELS[os.status]}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-slate-900">Cliente</p>
            <p>{os.cliente.nome}</p>
            <p>{os.cliente.telefone}</p>
            {os.cliente.email && <p>{os.cliente.email}</p>}
          </div>
          <div>
            <p className="font-semibold text-slate-900">Equipamento</p>
            <p>
              {os.equipamento.tipo} — {os.equipamento.marca} {os.equipamento.modelo}
            </p>
            {os.equipamento.numeroSerie && <p>Nº série/IMEI: {os.equipamento.numeroSerie}</p>}
            {os.equipamento.acessorios && <p>Acessórios: {os.equipamento.acessorios}</p>}
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-900">Defeito relatado</p>
          <p>{os.defeitoRelatado}</p>
        </div>

        {os.diagnostico && (
          <div>
            <p className="font-semibold text-slate-900">Diagnóstico</p>
            <p>{os.diagnostico}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-slate-900">Abertura</p>
            <p>{formatDate(os.dataAbertura)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Previsão de entrega</p>
            <p>{formatDate(os.dataPrevisao)}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <p className="font-semibold text-slate-900">Valores</p>
          <p>Orçamento: {formatMoneyFromCentavos(os.valorOrcamentoCentavos)}</p>
          <p>Peças: {formatMoneyFromCentavos(os.valorPecasCentavos)}</p>
          <p>Mão de obra: {formatMoneyFromCentavos(os.valorMaoObraCentavos)}</p>
          <p className="font-semibold">Total: {formatMoneyFromCentavos(os.valorTotalCentavos)}</p>
          {os.formaPagamento && <p>Forma de pagamento: {os.formaPagamento}</p>}
        </div>

        {os.garantiaDias != null && (
          <div className="border-t border-slate-200 pt-3">
            <p className="font-semibold text-slate-900">Garantia</p>
            <p>{os.garantiaDias} dias</p>
            {os.garantiaObservacoes && <p>{os.garantiaObservacoes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
