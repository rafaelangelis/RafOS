import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateItem,
  useDeleteItem,
  type ItemTipo,
  type OrdemItem,
} from "@/features/ordens/ordens.api";
import { formatMoneyFromCentavos } from "@/lib/utils";

function toCentavos(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

interface ItensLinhaTableProps {
  osId: string;
  tipo: ItemTipo;
  itens: OrdemItem[];
  podeEditar: boolean;
}

export function ItensLinhaTable({ osId, tipo, itens, podeEditar }: ItensLinhaTableProps) {
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const createItem = useCreateItem(osId);
  const deleteItem = useDeleteItem(osId);

  const totalCentavos = itens.reduce((acc, i) => acc + i.precoTotalCentavos, 0);

  async function adicionar() {
    const precoUnitarioCentavos = toCentavos(precoUnitario);
    const quantidadeNum = Number(quantidade);

    if (!descricao || precoUnitarioCentavos === undefined || !quantidadeNum || quantidadeNum <= 0) {
      toast.error("Preencha descrição, quantidade e preço unitário");
      return;
    }

    try {
      await createItem.mutateAsync({
        tipo,
        descricao,
        quantidade: quantidadeNum,
        precoUnitarioCentavos,
      });
      setDescricao("");
      setQuantidade("1");
      setPrecoUnitario("");
    } catch {
      toast.error("Não foi possível adicionar o item");
    }
  }

  async function remover(itemId: number) {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch {
      toast.error("Não foi possível remover o item");
    }
  }

  return (
    <div className="space-y-2">
      {itens.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-1">Descrição</th>
              <th className="py-1">Qtd</th>
              <th className="py-1">Preço unit.</th>
              <th className="py-1">Total</th>
              {podeEditar && <th className="py-1"></th>}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-1.5">{item.descricao}</td>
                <td className="py-1.5">{item.quantidade}</td>
                <td className="py-1.5">{formatMoneyFromCentavos(item.precoUnitarioCentavos)}</td>
                <td className="py-1.5 font-medium">
                  {formatMoneyFromCentavos(item.precoTotalCentavos)}
                </td>
                {podeEditar && (
                  <td className="py-1.5 text-right">
                    <button
                      onClick={() => remover(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="py-1.5 text-right font-medium text-slate-500">
                Total
              </td>
              <td className="py-1.5 font-semibold">{formatMoneyFromCentavos(totalCentavos)}</td>
              {podeEditar && <td></td>}
            </tr>
          </tfoot>
        </table>
      )}

      {podeEditar && (
        <div className="grid grid-cols-4 gap-2">
          <Input
            className="col-span-2"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <Input
            placeholder="Qtd"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
          <Input
            placeholder="Preço unit. (R$)"
            value={precoUnitario}
            onChange={(e) => setPrecoUnitario(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionar}
            disabled={createItem.isPending}
            className="col-span-4"
          >
            + Adicionar {tipo === "peca" ? "peça" : "serviço"}
          </Button>
        </div>
      )}
    </div>
  );
}
