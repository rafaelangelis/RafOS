import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { usuariosRouter } from "./modules/usuarios/usuarios.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);
