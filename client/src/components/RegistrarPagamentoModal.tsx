import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabelWithAdd } from "@/components/FieldLabelWithAdd";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickAddFormaPagamentoModal } from "@/components/QuickAddFormaPagamentoModal";
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
  clienteNome?: string;
  saldoDevedorCentavos?: number | null;
  onRegistrado?: () => void;
}

export function RegistrarPagamentoModal({
  open,
  onClose,
  osId,
  clienteNome,
  saldoDevedorCentavos,
  onRegistrado,
}: RegistrarPagamentoModalProps) {
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [novaFormaModalOpen, setNovaFormaModalOpen] = useState(false);
  const registrarPagamento = useRegistrarPagamento(osId ? String(osId) : "");
  const { data: formasPagamento } = useFormasPagamento();

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
    setObservacao("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const valorCentavos = toCentavos(valor);
    if (!valorCentavos || valorCentavos <= 0 || !forma) {
      setError("Informe um valor válido e a forma de pagamento");
      return;
    }

    try {
      await registrarPagamento.mutateAsync({
        valorCentavos,
        formaPagamento: forma,
        observacao: observacao || undefined,
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
    </>
  );
}
