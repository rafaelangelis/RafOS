import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateFormaPagamento,
  type FormaPagamento,
} from "@/features/formas-pagamento/formasPagamento.api";

interface QuickAddFormaPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (formaPagamento: FormaPagamento) => void;
}

export function QuickAddFormaPagamentoModal({
  open,
  onClose,
  onCreated,
}: QuickAddFormaPagamentoModalProps) {
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createFormaPagamento = useCreateFormaPagamento();

  function fechar() {
    setNome("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nome) {
      setError("Preencha o nome");
      return;
    }

    try {
      const forma = await createFormaPagamento.mutateAsync(nome);
      toast.success("Forma de pagamento cadastrada");
      onCreated(forma);
      fechar();
    } catch {
      setError("Não foi possível cadastrar (talvez já exista)");
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Nova Forma de Pagamento">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label required>Nome</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex: Transferência, Vale, Cheque..."
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createFormaPagamento.isPending}>
            {createFormaPagamento.isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
