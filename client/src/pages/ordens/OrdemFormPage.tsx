import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClienteSearchSelect } from "@/components/ClienteSearchSelect";
import { EquipamentoSearchSelect } from "@/components/EquipamentoSearchSelect";
import { FieldLabelWithAdd } from "@/components/FieldLabelWithAdd";
import { QuickAddClienteModal } from "@/components/QuickAddClienteModal";
import { QuickAddFormaPagamentoModal } from "@/components/QuickAddFormaPagamentoModal";
import { QuickAddTecnicoModal } from "@/components/QuickAddTecnicoModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";
import { useClienteEquipamentos, type Cliente } from "@/features/clientes/clientes.api";
import { useFormasPagamento } from "@/features/formas-pagamento/formasPagamento.api";
import { useCreateOrdem } from "@/features/ordens/ordens.api";
import { useTecnicos } from "@/features/usuarios/usuarios.api";

function toCentavos(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

interface ParcelaForm {
  dataVencimento: string;
  valor: string;
  formaPagamento: string;
}

export function OrdemFormPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { data: tecnicos } = useTecnicos();
  const { data: formasPagamento } = useFormasPagamento();
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
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [numParcelas, setNumParcelas] = useState("1");
  const [primeiraDataVencimento, setPrimeiraDataVencimento] = useState("");
  const [intervaloDias, setIntervaloDias] = useState("30");
  const [parcelas, setParcelas] = useState<ParcelaForm[]>([]);
  const [novaFormaModalOpen, setNovaFormaModalOpen] = useState(false);
  const [novaFormaParcelaIndex, setNovaFormaParcelaIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: equipamentos, isLoading: carregandoEquipamentos } = useClienteEquipamentos(
    clienteId || undefined
  );

  function gerarParcelas() {
    const totalCentavos = toCentavos(valorOrcamento);
    const n = Math.max(1, Number(numParcelas) || 1);

    if (!totalCentavos || totalCentavos <= 0) {
      setError("Preencha o orçamento estimado antes de gerar as parcelas");
      return;
    }

    const valorBase = Math.floor(totalCentavos / n);
    const resto = totalCentavos - valorBase * n;
    const primeira = primeiraDataVencimento ? new Date(`${primeiraDataVencimento}T00:00:00`) : new Date();
    const intervalo = Number(intervaloDias) || 30;

    const novas: ParcelaForm[] = Array.from({ length: n }, (_, i) => {
      const data = new Date(primeira);
      data.setDate(data.getDate() + i * intervalo);
      const valor = valorBase + (i === n - 1 ? resto : 0);
      return {
        dataVencimento: data.toISOString().slice(0, 10),
        valor: (valor / 100).toFixed(2),
        formaPagamento: "",
      };
    });

    setParcelas(novas);
  }

  function atualizarParcela(index: number, campo: keyof ParcelaForm, valor: string) {
    setParcelas((atual) => atual.map((p, i) => (i === index ? { ...p, [campo]: valor } : p)));
  }

  function removerParcela(index: number) {
    setParcelas((atual) => atual.filter((_, i) => i !== index));
  }

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
        valorOrcamentoCentavos: valorOrcamento ? toCentavos(valorOrcamento) : undefined,
        parcelas:
          parcelas.length > 0
            ? parcelas.map((p) => ({
                dataVencimento: new Date(`${p.dataVencimento}T00:00:00`).toISOString(),
                valorCentavos: toCentavos(p.valor) ?? 0,
                formaPagamento: p.formaPagamento || undefined,
              }))
            : undefined,
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

        <div className="space-y-3 rounded-md border border-slate-200 p-3">
          <div className="space-y-1">
            <Label htmlFor="orcamento">Orçamento estimado (R$)</Label>
            <Input
              id="orcamento"
              className="max-w-xs"
              value={valorOrcamento}
              onChange={(e) => setValorOrcamento(e.target.value)}
              placeholder="opcional"
            />
          </div>

          {valorOrcamento && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Parcelamento (opcional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="numParcelas">Nº de parcelas</Label>
                  <Input
                    id="numParcelas"
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="primeiraData">1ª data de vencimento</Label>
                  <Input
                    id="primeiraData"
                    type="date"
                    value={primeiraDataVencimento}
                    onChange={(e) => setPrimeiraDataVencimento(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="intervalo">Intervalo (dias)</Label>
                  <Input
                    id="intervalo"
                    value={intervaloDias}
                    onChange={(e) => setIntervaloDias(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={gerarParcelas}>
                Gerar parcelas
              </Button>

              {parcelas.length > 0 && (
                <div className="space-y-2">
                  {parcelas.map((p, index) => (
                    <div key={index} className="grid grid-cols-4 items-end gap-2">
                      <div className="space-y-1">
                        <Label>Vencimento</Label>
                        <Input
                          type="date"
                          value={p.dataVencimento}
                          onChange={(e) => atualizarParcela(index, "dataVencimento", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Valor (R$)</Label>
                        <Input
                          value={p.valor}
                          onChange={(e) => atualizarParcela(index, "valor", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabelWithAdd
                          onAdd={() => {
                            setNovaFormaParcelaIndex(index);
                            setNovaFormaModalOpen(true);
                          }}
                          addTitle="Cadastrar nova forma de pagamento"
                        >
                          Forma
                        </FieldLabelWithAdd>
                        <select
                          value={p.formaPagamento}
                          onChange={(e) => atualizarParcela(index, "formaPagamento", e.target.value)}
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
                      <button
                        type="button"
                        onClick={() => removerParcela(index)}
                        className="mb-2 text-sm text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      <QuickAddFormaPagamentoModal
        open={novaFormaModalOpen}
        onClose={() => setNovaFormaModalOpen(false)}
        onCreated={(novaForma) => {
          if (novaFormaParcelaIndex !== null) {
            atualizarParcela(novaFormaParcelaIndex, "formaPagamento", novaForma.nome);
          }
        }}
      />
    </div>
  );
}
