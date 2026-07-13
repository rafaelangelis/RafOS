import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      await login(data.email, data.senha);
      navigate("/");
    } catch {
      setError("Email ou senha inválidos");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-bold text-slate-900">RafOS — Entrar</h1>

        <div className="mb-4 space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="mb-4 space-y-1">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" {...register("senha")} />
          {errors.senha && <p className="text-xs text-red-600">{errors.senha.message}</p>}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
