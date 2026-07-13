import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useClientes, type Cliente } from "@/features/clientes/clientes.api";

interface ClienteSearchSelectProps {
  onSelect: (cliente: Cliente | null) => void;
  preSelecionado?: Cliente | null;
}

export function ClienteSearchSelect({ onSelect, preSelecionado }: ClienteSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: clientes, isFetching } = useClientes(debouncedQuery || undefined);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (preSelecionado) {
      setSelecionado(preSelecionado);
      setOpen(false);
    }
  }, [preSelecionado]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selecionar(cliente: Cliente) {
    setSelecionado(cliente);
    setQuery("");
    setOpen(false);
    onSelect(cliente);
  }

  function trocar() {
    setSelecionado(null);
    onSelect(null);
  }

  if (selecionado) {
    return (
      <div className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
        <span>
          <span className="font-medium">{selecionado.nome}</span> — {selecionado.telefone}
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
        placeholder="Buscar cliente por nome ou telefone..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-md">
          {isFetching && <p className="p-2 text-sm text-slate-400">Buscando...</p>}

          {!isFetching && clientes?.length === 0 && (
            <p className="p-2 text-sm text-slate-400">Nenhum cliente encontrado</p>
          )}

          {!isFetching &&
            clientes?.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => selecionar(c)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                <span className="font-medium">{c.nome}</span> — {c.telefone}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
