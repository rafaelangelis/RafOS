import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUsuario, type TecnicoOpcao } from "@/features/usuarios/usuarios.api";

interface QuickAddTecnicoModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (tecnico: TecnicoOpcao) => void;
}

export function QuickAddTecnicoModal({ open, onClose, onCreated }: QuickAddTecnicoModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createUsuario = useCreateUsuario();

  function fechar() {
    setNome("");
    setEmail("");
    setSenha("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nome || !email || senha.length < 6) {
      setError("Preencha nome, email e senha (mínimo 6 caracteres)");
      return;
    }

    try {
      const usuario = await createUsuario.mutateAsync({ nome, email, senha, role: "tecnico" });
      toast.success("Técnico cadastrado");
      onCreated({ id: usuario.id, nome: usuario.nome });
      fechar();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Não foi possível cadastrar o técnico";
      setError(message);
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Novo Técnico">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label required>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </div>
        <div className="space-y-1">
          <Label required>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label required>Senha</Label>
          <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createUsuario.isPending}>
            {createUsuario.isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
