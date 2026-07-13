import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateUsuario,
  useUpdateUsuario,
  useUsuario,
} from "@/features/usuarios/usuarios.api";

const formSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["admin", "tecnico", "atendente"]),
});

type FormValues = z.infer<typeof formSchema>;

export function UsuarioFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: usuario } = useUsuario(id);
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: "atendente" },
  });

  useEffect(() => {
    if (usuario) {
      reset({ nome: usuario.nome, email: usuario.email, role: usuario.role, senha: "" });
    }
  }, [usuario, reset]);

  async function onSubmit(values: FormValues) {
    const payload = { ...values, senha: values.senha || undefined };
    if (isEdit) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync({ ...payload, senha: payload.senha! });
    }
    navigate("/usuarios");
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {isEdit ? "Editar Usuário" : "Novo Usuário"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" {...register("nome")} />
          {errors.nome && <p className="text-xs text-red-600">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="senha">{isEdit ? "Nova senha (opcional)" : "Senha"}</Label>
          <Input id="senha" type="password" {...register("senha")} />
          {errors.senha && <p className="text-xs text-red-600">{errors.senha.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="role">Papel</Label>
          <select
            id="role"
            {...register("role")}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="tecnico">Técnico</option>
            <option value="atendente">Atendente</option>
          </select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
