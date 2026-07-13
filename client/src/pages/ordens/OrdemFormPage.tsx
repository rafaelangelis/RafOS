import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClienteSearchSelect } from "@/components/ClienteSearchSelect";
import { EquipamentoSearchSelect } from "@/components/EquipamentoSearchSelect";
import { FieldLabelWithAdd } from "@/components/FieldLabelWithAdd";
import { QuickAddClienteModal } from "@/components/QuickAddClienteModal";
import { QuickAddTecnicoModal } from "@/components/QuickAddTecnicoModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";
import { useClienteEquipamentos, type Cliente } from "@/features/clientes/clientes.api";
import { useCreateOrdem } from "@/features/ordens/ordens.api";
import { useTecnicos } from "@/features/usuarios/usuarios.api";

export function OrdemFormPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { data: tecnicos } = useTecnicos();
  const createOrdem = useCreateOrdem();

  const [clienteId, setClienteId] = useState("");
  const [clienteRecemCriado, setClienteRecemCriado] = useState<Cliente | null>(null);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [tecnicoModalOpen, setTecnicoModalOpen] = useState(false);
  const [equipamentoId, setEquipamentoId] = useState("");
  const [novoEquipamento, setNovoEquipamento] = useState(false);
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [acessorios, setAcessorios] = useState("");
  const [tecnicoResponsavelId, setTecnicoResponsavelId] = useState("");
  const [defeitoRelatado, setDefeitoRelatado] = useState("");
  const [dataPrevisao, setDataPrevisao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: equipamentos, isLoading: carregandoEquipamentos } = useClienteEquipamentos(
    clienteId || undefined
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clienteId) {
      setError("Selecione um cliente");
      return;
    }
    if (!novoEquipamento && !equipamentoId) {
      setError("Selecione um equipamento ou cadastre um novo");
      return;
    }
    if (novoEquipamento && !tipo) {
      setError("Preencha o tipo do equipamento");
      return;
    }

    try {
      const os = await createOrdem.mutateAsync({
        clienteId: Number(clienteId),
        equipamentoId: novoEquipamento ? undefined : Number(equipamentoId),
        equipamentoNovo: novoEquipamento
          ? {
              tipo,
              marca: marca || undefined,
              modelo: modelo || undefined,
              numeroSerie: numeroSerie || undefined,
              senhaAcesso: senhaAcesso || undefined,
              acessorios: acessorios || undefined,
            }
          : undefined,
        tecnicoResponsavelId: tecnicoResponsavelId ? Number(tecnicoResponsavelId) : undefined,
        defeitoRelatado,
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao).toISOString() : undefined,
        observacoes: observacoes || undefined,
      });
      navigate(`/ordens/${os.id}`);
    } catch {
      setError("Não foi possível criar a OS. Verifique os dados.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Nova Ordem de Serviço</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <FieldLabelWithAdd
            required
            onAdd={() => setClienteModalOpen(true)}
            addTitle="Cadastrar novo cliente"
          >
            Cliente
          </FieldLabelWithAdd>
          <ClienteSearchSelect
            preSelecionado={clienteRecemCriado}
            onSelect={(cliente) => {
              setClienteId(cliente ? String(cliente.id) : "");
              setEquipamentoId("");
            }}
          />
        </div>

        {clienteId && (
          <div className="space-y-2 rounded-md border border-slate-200 p-3">
            {!novoEquipamento && (
              <div className="space-y-1">
                <FieldLabelWithAdd
                  required
                  onAdd={() => setNovoEquipamento(true)}
                  addTitle="Cadastrar novo equipamento"
                >
                  Equipamento
                </FieldLabelWithAdd>
                <EquipamentoSearchSelect
                  key={clienteId}
                  equipamentos={equipamentos}
                  loading={carregandoEquipamentos}
                  onSelect={(equipamento) => setEquipamentoId(equipamento ? String(equipamento.id) : "")}
                />
              </div>
            )}

            {novoEquipamento && (
              <button
                type="button"
                onClick={() => setNovoEquipamento(false)}
                className="text-sm text-slate-600 hover:underline"
              >
                Usar equipamento existente
              </button>
            )}

            {novoEquipamento && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="tipo" required>Tipo</Label>
                  <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="celular, notebook..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numeroSerie">Nº Série / IMEI</Label>
                  <Input id="numeroSerie" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="senhaAcesso">Senha de acesso</Label>
                  <Input id="senhaAcesso" value={senhaAcesso} onChange={(e) => setSenhaAcesso(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="acessorios">Acessórios</Label>
                  <Input id="acessorios" value={acessorios} onChange={(e) => setAcessorios(e.target.value)} placeholder="carregador, capa..." />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="defeito" required>Defeito relatado</Label>
          <Input
            id="defeito"
            value={defeitoRelatado}
            onChange={(e) => setDefeitoRelatado(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            {hasRole("admin") ? (
              <FieldLabelWithAdd onAdd={() => setTecnicoModalOpen(true)} addTitle="Cadastrar novo técnico">
                Técnico responsável
              </FieldLabelWithAdd>
            ) : (
              <Label htmlFor="tecnico">Técnico responsável</Label>
            )}
            <select
              id="tecnico"
              value={tecnicoResponsavelId}
              onChange={(e) => setTecnicoResponsavelId(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">Não atribuído</option>
              {tecnicos?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="previsao">Previsão de entrega</Label>
            <Input
              id="previsao"
              type="date"
              value={dataPrevisao}
              onChange={(e) => setDataPrevisao(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="observacoes">Observações</Label>
          <Input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={createOrdem.isPending}>
          {createOrdem.isPending ? "Criando..." : "Abrir OS"}
        </Button>
      </form>

      <QuickAddClienteModal
        open={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onCreated={(cliente) => {
          setClienteId(String(cliente.id));
          setEquipamentoId("");
          setClienteRecemCriado(cliente);
        }}
      />

      <QuickAddTecnicoModal
        open={tecnicoModalOpen}
        onClose={() => setTecnicoModalOpen(false)}
        onCreated={(tecnico) => setTecnicoResponsavelId(String(tecnico.id))}
      />
    </div>
  );
}
