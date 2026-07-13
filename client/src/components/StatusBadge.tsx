import { STATUS_LABELS, type StatusOS } from "@/features/ordens/ordens.api";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<StatusOS, string> = {
  aberta: "bg-slate-100 text-slate-700",
  em_analise: "bg-blue-100 text-blue-700",
  aguardando_aprovacao: "bg-amber-100 text-amber-700",
  aguardando_peca: "bg-orange-100 text-orange-700",
  em_conserto: "bg-indigo-100 text-indigo-700",
  pronta: "bg-emerald-100 text-emerald-700",
  entregue: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: StatusOS }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
