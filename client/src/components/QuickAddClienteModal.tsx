import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCliente, type Cliente } from "@/features/clientes/clientes.api";

interface QuickAddClienteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (cliente: Cliente) => void;
}

export function QuickAddClienteModal({ open, onClose, onCreated }: QuickAddClienteModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createCliente = useCreateCliente();

  function fechar() {
    setNome("");
    setTelefone("");
    setEmail("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nome || !telefone) {
      setError("Preencha nome e telefone");
      return;
    }

    try {
      const cliente = await createCliente.mutateAsync({
        nome,
        telefone,
        email: email || undefined,
      });
      toast.success("Cliente cadastrado");
      onCreated(cliente);
      fechar();
    } catch {
      setError("Não foi possível cadastrar o cliente");
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label required>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </div>
        <div className="space-y-1">
          <Label required>Telefone</Label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createCliente.isPending}>
            {createCliente.isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
