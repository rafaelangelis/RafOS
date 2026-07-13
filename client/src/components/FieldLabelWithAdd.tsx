import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FieldLabelWithAddProps {
  children: ReactNode;
  required?: boolean;
  onAdd: () => void;
  addTitle: string;
}

export function FieldLabelWithAdd({ children, required, onAdd, addTitle }: FieldLabelWithAddProps) {
  return (
    <div className="flex items-center justify-between">
      <Label required={required}>{children}</Label>
      <button
        type="button"
        onClick={onAdd}
        title={addTitle}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
