import { QuickAddNomeModal } from "@/components/QuickAddNomeModal";
import {
  useCreateContaFinanceira,
  type ContaFinanceira,
} from "@/features/contas-financeiras/contasFinanceiras.api";

interface QuickAddContaFinanceiraModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conta: ContaFinanceira) => void;
}

export function QuickAddContaFinanceiraModal(props: QuickAddContaFinanceiraModalProps) {
  const createConta = useCreateContaFinanceira();

  return (
    <QuickAddNomeModal
      {...props}
      title="Nova Conta Financeira"
      placeholder="ex: Banco do Brasil, Nubank..."
      successMessage="Conta financeira cadastrada"
      errorMessage="Não foi possível cadastrar (talvez já exista)"
      isPending={createConta.isPending}
      onSubmit={(nome) => createConta.mutateAsync(nome)}
    />
  );
}
