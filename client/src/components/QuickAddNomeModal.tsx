import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickAddNomeModalProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  successMessage: string;
  errorMessage: string;
  isPending: boolean;
  onSubmit: (nome: string) => Promise<T>;
  onCreated: (created: T) => void;
}

export function QuickAddNomeModal<T>({
  open,
  onClose,
  title,
  placeholder,
  successMessage,
  errorMessage,
  isPending,
  onSubmit,
  onCreated,
}: QuickAddNomeModalProps<T>) {
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      const created = await onSubmit(nome);
      toast.success(successMessage);
      onCreated(created);
      fechar();
    } catch {
      setError(errorMessage);
    }
  }

  return (
    <Modal open={open} onClose={fechar} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label required>Nome</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
