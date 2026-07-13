import { QuickAddNomeModal } from "@/components/QuickAddNomeModal";
import {
  useCreateFormaPagamento,
  type FormaPagamento,
} from "@/features/formas-pagamento/formasPagamento.api";

interface QuickAddFormaPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (formaPagamento: FormaPagamento) => void;
}

export function QuickAddFormaPagamentoModal(props: QuickAddFormaPagamentoModalProps) {
  const createFormaPagamento = useCreateFormaPagamento();

  return (
    <QuickAddNomeModal
      {...props}
      title="Nova Forma de Pagamento"
      placeholder="ex: Transferência, Vale, Cheque..."
      successMessage="Forma de pagamento cadastrada"
      errorMessage="Não foi possível cadastrar (talvez já exista)"
      isPending={createFormaPagamento.isPending}
      onSubmit={(nome) => createFormaPagamento.mutateAsync(nome)}
    />
  );
}
