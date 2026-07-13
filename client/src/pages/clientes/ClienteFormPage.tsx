import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCliente,
  useClienteEquipamentos,
  useClienteOrdens,
  useCreateCliente,
  useUpdateCliente,
} from "@/features/clientes/clientes.api";
import { formatDate } from "@/lib/utils";

const formSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  telefone: z.string().min(1, "Telefone obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  cpfCnpj: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ClienteFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: cliente } = useCliente(id);
  const { data: equipamentos } = useClienteEquipamentos(id);
  const { data: ordens } = useClienteOrdens(id);
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email ?? "",
        endereco: cliente.endereco ?? "",
        cpfCnpj: cliente.cpfCnpj ?? "",
        observacoes: cliente.observacoes ?? "",
      });
    }
  }, [cliente, reset]);

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate("/clientes");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? "Editar Cliente" : "Novo Cliente"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-xs text-red-600">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} />
            {errors.telefone && <p className="text-xs text-red-600">{errors.telefone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
            <Input id="cpfCnpj" {...register("cpfCnpj")} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...register("endereco")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="observacoes">Observações</Label>
          <Input id="observacoes" {...register("observacoes")} />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>

      {isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="font-semibold text-slate-900">Equipamentos</CardHeader>
            <CardContent>
              {equipamentos?.length ? (
                <ul className="space-y-1 text-sm">
                  {equipamentos.map((e: { id: number; tipo: string; marca: string; modelo: string }) => (
                    <li key={e.id}>
                      {e.tipo} — {e.marca} {e.modelo}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Nenhum equipamento cadastrado ainda.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="font-semibold text-slate-900">Ordens de Serviço</CardHeader>
            <CardContent>
              {ordens?.length ? (
                <ul className="space-y-1 text-sm">
                  {ordens.map((o: { id: number; status: string; dataAbertura: string }) => (
                    <li key={o.id}>
                      OS #{o.id} — {o.status} ({formatDate(o.dataAbertura)})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Nenhuma OS registrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
