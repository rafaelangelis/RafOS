import type { StatusPagamento } from "@/features/ordens/ordens.api";
import { cn } from "@/lib/utils";

const LABELS: Record<StatusPagamento, string> = {
  sem_valor: "Sem valor definido",
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
};

const COLORS: Record<StatusPagamento, string> = {
  sem_valor: "bg-slate-100 text-slate-500",
  pendente: "bg-red-100 text-red-700",
  parcial: "bg-amber-100 text-amber-700",
  pago: "bg-green-100 text-green-700",
};

export function PagamentoStatusBadge({ status }: { status: StatusPagamento }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", COLORS[status])}>
      {LABELS[status]}
    </span>
  );
}
