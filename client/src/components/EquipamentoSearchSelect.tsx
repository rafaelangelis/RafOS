import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Equipamento } from "@/features/clientes/clientes.api";

interface EquipamentoSearchSelectProps {
  equipamentos: Equipamento[] | undefined;
  loading?: boolean;
  onSelect: (equipamento: Equipamento | null) => void;
}

export function EquipamentoSearchSelect({
  equipamentos,
  loading,
  onSelect,
}: EquipamentoSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<Equipamento | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resultados = useMemo(() => {
    const termo = query.trim().toLowerCase();
    if (!termo) return equipamentos ?? [];
    return (equipamentos ?? []).filter((eq) =>
      [eq.tipo, eq.marca, eq.modelo, eq.numeroSerie ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [equipamentos, query]);

  function selecionar(equipamento: Equipamento) {
    setSelecionado(equipamento);
    setQuery("");
    setOpen(false);
    onSelect(equipamento);
  }

  function trocar() {
    setSelecionado(null);
    onSelect(null);
  }

  if (selecionado) {
    return (
      <div className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
        <span>
          <span className="font-medium">{selecionado.tipo}</span> — {selecionado.marca}{" "}
          {selecionado.modelo}
        </span>
        <button type="button" onClick={trocar} className="text-slate-500 hover:underline">
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Buscar equipamento por tipo, marca, modelo ou nº série..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-md">
          {loading && <p className="p-2 text-sm text-slate-400">Carregando...</p>}

          {!loading && resultados.length === 0 && (
            <p className="p-2 text-sm text-slate-400">Nenhum equipamento encontrado</p>
          )}

          {!loading &&
            resultados.map((eq) => (
              <button
                type="button"
                key={eq.id}
                onClick={() => selecionar(eq)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                <span className="font-medium">{eq.tipo}</span> — {eq.marca} {eq.modelo}
                {eq.numeroSerie && <span className="text-slate-400"> ({eq.numeroSerie})</span>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
