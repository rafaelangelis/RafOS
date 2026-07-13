import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabelWithAdd } from "@/components/FieldLabelWithAdd";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickAddCategoriaFinanceiraModal } from "@/components/QuickAddCategoriaFinanceiraModal";
import { QuickAddContaFinanceiraModal } from "@/components/QuickAddContaFinanceiraModal";
import { QuickAddFormaPagamentoModal } from "@/components/QuickAddFormaPagamentoModal";
import { useCategoriasFinanceiras } from "@/features/categorias-financeiras/categoriasFinanceiras.api";
import { useContasFinanceiras } from "@/features/contas-financeiras/contasFinanceiras.api";
import { useRegistrarPagamento } from "@/features/financeiro/financeiro.api";
import { useFormasPagamento } from "@/features/formas-pagamento/formasPagamento.api";
import { formatMoneyFromCentavos } from "@/lib/utils";

function toCentavos(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

interface RegistrarPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  osId: number | null;
  parcelaId?: number | null;
  clienteNome?: string;
  saldoDevedorCentavos?: number | null;
  onRegistrado?: () => void;
}

export function RegistrarPagamentoModal({
  open,
  onClose,
  osId,
  parcelaId,
  clienteNome,
  saldoDevedorCentavos,
  onRegistrado,
}: RegistrarPagamentoModalProps) {
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("");
  const [contaFinanceiraId, setContaFinanceiraId] = useState("");
  const [categoriaFinanceiraId, setCategoriaFinanceiraId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [novaFormaModalOpen, setNovaFormaModalOpen] = useState(false);
  const [novaContaModalOpen, setNovaContaModalOpen] = useState(false);
  const [novaCategoriaModalOpen, setNovaCategoriaModalOpen] = useState(false);
  const registrarPagamento = useRegistrarPagamento(osId ? String(osId) : "");
  const { data: formasPagamento } = useFormasPagamento();
  const { data: contasFinanceiras } = useContasFinanceiras();
  const { data: categoriasFinanceiras } = useCategoriasFinanceiras();

  useEffect(() => {
    if (open) {
      setValor(
        saldoDevedorCentavos && saldoDevedorCentavos > 0
          ? (saldoDevedorCentavos / 100).toFixed(2)
          : ""
      );
    }
  }, [open, saldoDevedorCentavos]);

  function fechar() {
    setValor("");
    setForma("");
    setContaFinanceiraId("");
    setCategoriaFinanceiraId("");
    setObservacao("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const valorCentavos = toCentavos(valor);
    if (!valorCentavos || valorCentavos <= 0 || !forma || !contaFinanceiraId) {
      setError("Informe um valor válido, a forma de pagamento e a conta financeira");
      return;
    }

    try {
      await registrarPagamento.mutateAsync({
        valorCentavos,
        formaPagamento: forma,
        contaFinanceiraId: Number(contaFinanceiraId),
        categoriaFinanceiraId: categoriaFinanceiraId ? Number(categoriaFinanceiraId) : undefined,
        observacao: observacao || undefined,
        parcelaId: parcelaId ?? undefined,
      });
      toast.success("Pagamento registrado");
      onRegistrado?.();
      fechar();
    } catch {
      setError("Não foi possível registrar o pagamento");
    }
  }

  return (
    <>
      <Modal open={open} onClose={fechar} title={`Registrar pagamento — OS #${osId ?? ""}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {clienteNome && <p className="text-sm text-slate-600">{clienteNome}</p>}
          {saldoDevedorCentavos != null && (
            <p className="text-sm text-slate-500">
              Saldo devedor:{" "}
              <span className="font-medium">{formatMoneyFromCentavos(saldoDevedorCentavos)}</span>
            </p>
          )}

          <div className="space-y-1">
            <Label required>Valor (R$)</Label>
            <Input value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
          </div>

          <div className="space-y-1">
            <FieldLabelWithAdd
              required
              onAdd={() => setNovaFormaModalOpen(true)}
              addTitle="Cadastrar nova forma de pagamento"
            >
              Forma de pagamento
            </FieldLabelWithAdd>
            <select
              value={forma}
              onChange={(e) => setForma(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">Selecione...</option>
              {formasPagamento?.map((f) => (
                <option key={f.id} value={f.nome}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <FieldLabelWithAdd
              required
              onAdd={() => setNovaContaModalOpen(true)}
              addTitle="Cadastrar nova conta financeira"
            >
              Conta financeira
            </FieldLabelWithAdd>
            <select
              value={contaFinanceiraId}
              onChange={(e) => setContaFinanceiraId(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">Selecione...</option>
              {contasFinanceiras?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <FieldLabelWithAdd
              onAdd={() => setNovaCategoriaModalOpen(true)}
              addTitle="Cadastrar nova categoria financeira"
            >
              Categoria (opcional)
            </FieldLabelWithAdd>
            <select
              value={categoriaFinanceiraId}
              onChange={(e) => setCategoriaFinanceiraId(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">Sem categoria</option>
              {categoriasFinanceiras?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Observação</Label>
            <Input value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={fechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={registrarPagamento.isPending}>
              {registrarPagamento.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </Modal>

      <QuickAddFormaPagamentoModal
        open={novaFormaModalOpen}
        onClose={() => setNovaFormaModalOpen(false)}
        onCreated={(novaForma) => setForma(novaForma.nome)}
      />
      <QuickAddContaFinanceiraModal
        open={novaContaModalOpen}
        onClose={() => setNovaContaModalOpen(false)}
        onCreated={(novaConta) => setContaFinanceiraId(String(novaConta.id))}
      />
      <QuickAddCategoriaFinanceiraModal
        open={novaCategoriaModalOpen}
        onClose={() => setNovaCategoriaModalOpen(false)}
        onCreated={(novaCategoria) => setCategoriaFinanceiraId(String(novaCategoria.id))}
      />
    </>
  );
}
