import { QuickAddNomeModal } from "@/components/QuickAddNomeModal";
import {
  useCreateCategoriaFinanceira,
  type CategoriaFinanceira,
} from "@/features/categorias-financeiras/categoriasFinanceiras.api";

interface QuickAddCategoriaFinanceiraModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (categoria: CategoriaFinanceira) => void;
}

export function QuickAddCategoriaFinanceiraModal(props: QuickAddCategoriaFinanceiraModalProps) {
  const createCategoria = useCreateCategoriaFinanceira();

  return (
    <QuickAddNomeModal
      {...props}
      title="Nova Categoria Financeira"
      placeholder="ex: Conserto, Venda de peça, Sinal..."
      successMessage="Categoria financeira cadastrada"
      errorMessage="Não foi possível cadastrar (talvez já exista)"
      isPending={createCategoria.isPending}
      onSubmit={(nome) => createCategoria.mutateAsync(nome)}
    />
  );
}
