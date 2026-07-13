import type { StatusParcela } from "@/features/ordens/ordens.api";
import { cn } from "@/lib/utils";

const LABELS: Record<StatusParcela, string> = {
  paga: "Paga",
  atrasada: "Atrasada",
  pendente: "Pendente",
};

const COLORS: Record<StatusParcela, string> = {
  paga: "bg-green-100 text-green-700",
  atrasada: "bg-red-100 text-red-700",
  pendente: "bg-amber-100 text-amber-700",
};

export function ParcelaStatusBadge({ status }: { status: StatusParcela }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", COLORS[status])}>
      {LABELS[status]}
    </span>
  );
}
