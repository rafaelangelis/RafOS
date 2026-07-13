import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { clientesRouter } from "./modules/clientes/clientes.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { equipamentosRouter } from "./modules/equipamentos/equipamentos.routes";
import { categoriasFinanceirasRouter } from "./modules/financeiro/categoriasFinanceiras.routes";
import { contasFinanceirasRouter } from "./modules/financeiro/contasFinanceiras.routes";
import { financeiroRouter } from "./modules/financeiro/financeiro.routes";
import { formasPagamentoRouter } from "./modules/formas-pagamento/formasPagamento.routes";
import { ordensRouter } from "./modules/ordens-servico/os.routes";
import { usuariosRouter } from "./modules/usuarios/usuarios.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/equipamentos", equipamentosRouter);
app.use("/api/ordens", ordensRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/financeiro", financeiroRouter);
app.use("/api/formas-pagamento", formasPagamentoRouter);
app.use("/api/contas-financeiras", contasFinanceirasRouter);
app.use("/api/categorias-financeiras", categoriasFinanceirasRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);
