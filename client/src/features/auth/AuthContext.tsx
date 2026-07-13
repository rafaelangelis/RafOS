import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiClient, clearToken, getToken, setToken } from "@/lib/api-client";

export type Role = "admin" | "tecnico" | "atendente";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get<Usuario>("/auth/me")
      .then((res) => setUsuario(res.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const res = await apiClient.post("/auth/login", { email, senha });
    setToken(res.data.token);
    setUsuario(res.data.usuario);
  }

  function logout() {
    clearToken();
    setUsuario(null);
  }

  function hasRole(...roles: Role[]) {
    return !!usuario && roles.includes(usuario.role);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
