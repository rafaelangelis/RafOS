import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ItensLinhaTable } from "@/components/ItensLinhaTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PagamentoStatusBadge } from "@/components/PagamentoStatusBadge";
import { ParcelaStatusBadge } from "@/components/ParcelaStatusBadge";
import { RegistrarPagamentoModal } from "@/components/RegistrarPagamentoModal";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { useDeletePagamento, useOsPagamentos } from "@/features/financeiro/financeiro.api";
import {
  STATUS_LABELS,
  STATUS_TRANSICOES,
  useChangeStatus,
  useOrdem,
  useOrdemHistorico,
  useUpdateOrdem,
  type StatusOS,
} from "@/features/ordens/ordens.api";
import { useTecnicos } from "@/features/usuarios/usuarios.api";
import { formatDate, formatMoneyFromCentavos } from "@/lib/utils";

function toReais(centavos: number | null | undefined) {
  return centavos != null ? (centavos / 100).toFixed(2) : "";
}

function toCentavos(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

export function OrdemDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const { data: os } = useOrdem(id);
  const { data: historico } = useOrdemHistorico(id);
  const { data: tecnicos } = useTecnicos();
  const { data: pagamentos } = useOsPagamentos(id);
  const updateOrdem = useUpdateOrdem(id ?? "");
  const changeStatus = useChangeStatus(id ?? "");
  const deletePagamento = useDeletePagamento(id ?? "");

  const [diagnostico, setDiagnostico] = useState("");
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [valorPecas, setValorPecas] = useState("");
  const [valorMaoObra, setValorMaoObra] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [tecnicoResponsavelId, setTecnicoResponsavelId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [garantiaDias, setGarantiaDias] = useState("");
  const [garantiaObservacoes, setGarantiaObservacoes] = useState("");
  const [observacaoStatus, setObservacaoStatus] = useState("");
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [parcelaIdSelecionada, setParcelaIdSelecionada] = useState<number | null>(null);

  useEffect(() => {
    if (os) {
      setDiagnostico(os.diagnostico ?? "");
      setValorOrcamento(toReais(os.valorOrcamentoCentavos));
      setValorPecas(toReais(os.valorPecasCentavos));
      setValorMaoObra(toReais(os.valorMaoObraCentavos));
      setFormaPagamento(os.formaPagamento ?? "");
      setTecnicoResponsavelId(os.tecnicoResponsavelId ? String(os.tecnicoResponsavelId) : "");
      setObservacoes(os.observacoes ?? "");
      setGarantiaDias(os.garantiaDias != null ? String(os.garantiaDias) : "");
      setGarantiaObservacoes(os.garantiaObservacoes ?? "");
    }
  }, [os]);

  if (!os) return <p className="text-slate-500">Carregando...</p>;

  const podeEditar = hasRole("admin", "tecnico", "atendente");
  const podeMudarStatus = hasRole("admin", "tecnico");
  const podeVerFinanceiro = hasRole("admin", "atendente");
  const podeExcluirPagamento = hasRole("admin");
  const proximosStatus = STATUS_TRANSICOES[os.status];

  async function salvar() {
    try {
      await updateOrdem.mutateAsync({
        diagnostico: diagnostico || undefined,
        valorOrcamentoCentavos: valorOrcamento ? toCentavos(valorOrcamento) : undefined,
        valorPecasCentavos: valorPecas ? toCentavos(valorPecas) : undefined,
        valorMaoObraCentavos: valorMaoObra ? toCentavos(valorMaoObra) : undefined,
        formaPagamento: formaPagamento || undefined,
        tecnicoResponsavelId: tecnicoResponsavelId ? Number(tecnicoResponsavelId) : null,
        observacoes: observacoes || undefined,
        garantiaDias: garantiaDias ? Number(garantiaDias) : undefined,
        garantiaObservacoes: garantiaObservacoes || undefined,
      });
      toast.success("OS atualizada");
    } catch {
      toast.error("Não foi possível salvar as alterações");
    }
  }

  async function mudarStatus(novoStatus: StatusOS) {
    try {
      await changeStatus.mutateAsync({ novoStatus, observacao: observacaoStatus || undefined });
      setObservacaoStatus("");
      toast.success(`Status alterado para ${STATUS_LABELS[novoStatus]}`);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Não foi possível mudar o status";
      toast.error(message);
    }
  }

  function abrirModalPagamento(parcelaId: number | null = null) {
    setParcelaIdSelecionada(parcelaId);
    setPagamentoModalOpen(true);
  }

  async function excluirPagamento(pagamentoId: number) {
    try {
      await deletePagamento.mutateAsync(pagamentoId);
      toast.success("Pagamento removido");
    } catch {
      toast.error("Não foi possível remover o pagamento");
    }
  }

  async function copiarMensagemWhatsapp() {
    if (!os) return;

    const mensagem =
      `Olá, ${os.cliente.nome}! Sua OS #${os.id} (${os.equipamento.marca} ${os.equipamento.modelo}) ` +
      `está com status: ${STATUS_LABELS[os.status]}.` +
      (os.status === "pronta" ? " Já pode vir buscar!" : "") +
      " Qualquer dúvida, estamos à disposição!";

    try {
      await navigator.clipboard.writeText(mensagem);
      toast.success("Mensagem copiada — cole no WhatsApp");
    } catch {
      toast.error("Não foi possível copiar a mensagem");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">OS #{os.id}</h1>
        <div className="flex items-center gap-3">
          <button onClick={copiarMensagemWhatsapp} className="text-sm text-slate-600 hover:underline">
            Copiar mensagem p/ WhatsApp
          </button>
          <Link to={`/ordens/${os.id}/imprimir`} className="text-sm text-slate-600 hover:underline">
            Imprimir / Recibo
          </Link>
          <StatusBadge status={os.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="font-semibold text-slate-900">Cliente</CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{os.cliente.nome}</p>
            <p className="text-slate-500">{os.cliente.telefone}</p>
            {os.cliente.email && <p className="text-slate-500">{os.cliente.email}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="font-semibold text-slate-900">Equipamento</CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">
              {os.equipamento.tipo} — {os.equipamento.marca} {os.equipamento.modelo}
            </p>
            {os.equipamento.numeroSerie && (
              <p className="text-slate-500">Nº série/IMEI: {os.equipamento.numeroSerie}</p>
            )}
            {os.equipamento.senhaAcesso && (
              <p className="text-slate-500">Senha de acesso: {os.equipamento.senhaAcesso}</p>
            )}
            {os.equipamento.acessorios && (
              <p className="text-slate-500">Acessórios: {os.equipamento.acessorios}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="font-semibold text-slate-900">Defeito relatado</CardHeader>
        <CardContent className="text-sm">{os.defeitoRelatado}</CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold text-slate-900">Diagnóstico e valores</CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Input
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              disabled={!podeEditar}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="orcamento">Orçamento (R$)</Label>
            <Input
              id="orcamento"
              className="max-w-xs"
              value={valorOrcamento}
              onChange={(e) => setValorOrcamento(e.target.value)}
              disabled={!podeEditar}
            />
          </div>

          <div className="space-y-1">
            <Label>Peças</Label>
            {(os.itens ?? []).filter((i) => i.tipo === "peca").length === 0 && podeEditar ? (
              <Input
                placeholder="Valor total de peças (R$) — ou adicione itens abaixo"
                value={valorPecas}
                onChange={(e) => setValorPecas(e.target.value)}
              />
            ) : null}
            <ItensLinhaTable
              osId={id ?? ""}
              tipo="peca"
              itens={(os.itens ?? []).filter((i) => i.tipo === "peca")}
              podeEditar={podeEditar}
            />
          </div>

          <div className="space-y-1">
            <Label>Serviços executados</Label>
            {(os.itens ?? []).filter((i) => i.tipo === "servico").length === 0 && podeEditar ? (
              <Input
                placeholder="Valor total de mão de obra (R$) — ou adicione itens abaixo"
                value={valorMaoObra}
                onChange={(e) => setValorMaoObra(e.target.value)}
              />
            ) : null}
            <ItensLinhaTable
              osId={id ?? ""}
              tipo="servico"
              itens={(os.itens ?? []).filter((i) => i.tipo === "servico")}
              podeEditar={podeEditar}
            />
          </div>

          <p className="text-sm text-slate-500">
            Total: <span className="font-medium text-slate-900">{formatMoneyFromCentavos(os.valorTotalCentavos)}</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="formaPagamento">Forma de pagamento</Label>
              <Input
                id="formaPagamento"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                placeholder="dinheiro, pix, cartão..."
                disabled={!podeEditar}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tecnico">Técnico responsável</Label>
              <select
                id="tecnico"
                value={tecnicoResponsavelId}
                onChange={(e) => setTecnicoResponsavelId(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                disabled={!podeEditar}
              >
                <option value="">Não atribuído</option>
                {tecnicos?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="observacoes">Observações</Label>
            <Input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={!podeEditar} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="garantiaDias">Garantia (dias)</Label>
              <Input
                id="garantiaDias"
                value={garantiaDias}
                onChange={(e) => setGarantiaDias(e.target.value)}
                placeholder="ex: 90"
                disabled={!podeEditar}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="garantiaObservacoes">Informações de garantia</Label>
              <Input
                id="garantiaObservacoes"
                value={garantiaObservacoes}
                onChange={(e) => setGarantiaObservacoes(e.target.value)}
                disabled={!podeEditar}
              />
            </div>
          </div>

          {podeEditar && (
            <Button onClick={salvar} disabled={updateOrdem.isPending}>
              {updateOrdem.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          )}
        </CardContent>
      </Card>

      {podeVerFinanceiro && (
        <Card>
          <CardHeader className="flex items-center justify-between font-semibold text-slate-900">
            <span>Pagamentos</span>
            {os.statusPagamento && <PagamentoStatusBadge status={os.statusPagamento} />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Valor total</p>
                <p className="font-medium text-slate-900">
                  {formatMoneyFromCentavos(os.valorTotalCentavos)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Pago</p>
                <p className="font-medium text-slate-900">
                  {formatMoneyFromCentavos(os.valorPagoCentavos ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Saldo devedor</p>
                <p className="font-medium text-slate-900">
                  {formatMoneyFromCentavos(os.saldoDevedorCentavos)}
                </p>
              </div>
            </div>

            {pagamentos && pagamentos.length > 0 && (
              <ul className="space-y-2 text-sm">
                {pagamentos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-2"
                  >
                    <span>
                      <span className="font-medium">{formatMoneyFromCentavos(p.valorCentavos)}</span>{" "}
                      via {p.formaPagamento} — {formatDate(p.data)}
                      {p.contaFinanceira && (
                        <span className="text-slate-500"> · {p.contaFinanceira.nome}</span>
                      )}
                      {p.categoriaFinanceira && (
                        <span className="text-slate-500"> · {p.categoriaFinanceira.nome}</span>
                      )}
                      {p.observacao && <span className="text-slate-500"> ({p.observacao})</span>}
                      <span className="text-slate-400"> · lançado por {p.registradoPor.nome}</span>
                    </span>
                    {podeExcluirPagamento && (
                      <button
                        onClick={() => excluirPagamento(p.id)}
                        className="text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {os.parcelas && os.parcelas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Parcelamento</p>
                <ul className="space-y-2 text-sm">
                  {os.parcelas.map((parcela) => (
                    <li
                      key={parcela.id}
                      className="flex items-center justify-between border-b border-slate-100 pb-2"
                    >
                      <span>
                        Parcela {parcela.numero} —{" "}
                        <span className="font-medium">
                          {formatMoneyFromCentavos(parcela.valorCentavos)}
                        </span>{" "}
                        venc. {formatDate(parcela.dataVencimento)}
                        {parcela.formaPagamento && <span className="text-slate-500"> ({parcela.formaPagamento})</span>}
                      </span>
                      <span className="flex items-center gap-2">
                        <ParcelaStatusBadge status={parcela.situacao} />
                        {parcela.situacao !== "paga" && (
                          <button
                            onClick={() => abrirModalPagamento(parcela.id)}
                            className="text-slate-600 hover:underline"
                          >
                            Registrar pagamento
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => abrirModalPagamento()}>Registrar pagamento</Button>
          </CardContent>
        </Card>
      )}

      {podeMudarStatus && proximosStatus.length > 0 && (
        <Card>
          <CardHeader className="font-semibold text-slate-900">Mudar status</CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Observação (opcional)"
              value={observacaoStatus}
              onChange={(e) => setObservacaoStatus(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {proximosStatus.map((s) => (
                <Button
                  key={s}
                  variant={s === "cancelada" ? "destructive" : "outline"}
                  onClick={() => mudarStatus(s)}
                  disabled={changeStatus.isPending}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="font-semibold text-slate-900">Histórico</CardHeader>
        <CardContent>
          {historico?.length ? (
            <ol className="space-y-2 text-sm">
              {historico.map((h) => (
                <li key={h.id} className="border-l-2 border-slate-200 pl-3">
                  <span className="font-medium">{STATUS_LABELS[h.statusNovo]}</span>{" "}
                  <span className="text-slate-500">
                    por {h.usuario.nome} em {formatDate(h.data)}
                  </span>
                  {h.observacao && <p className="text-slate-500">{h.observacao}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-400">Sem histórico ainda.</p>
          )}
        </CardContent>
      </Card>

      <RegistrarPagamentoModal
        open={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        osId={os.id}
        parcelaId={parcelaIdSelecionada}
        clienteNome={os.cliente.nome}
        saldoDevedorCentavos={
          parcelaIdSelecionada
            ? os.parcelas?.find((p) => p.id === parcelaIdSelecionada)?.valorCentavos
            : os.saldoDevedorCentavos
        }
      />
    </div>
  );
}
