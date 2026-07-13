-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN "garantia_dias" INTEGER;
ALTER TABLE "ordens_servico" ADD COLUMN "garantia_observacoes" TEXT;

-- CreateTable
CREATE TABLE "ordem_itens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "os_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unitario_centavos" INTEGER NOT NULL,
    "preco_total_centavos" INTEGER NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ordem_itens_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas_financeiras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "categorias_financeiras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "os_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "data_vencimento" DATETIME NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "forma_pagamento" TEXT,
    "pagamento_id" INTEGER,
    CONSTRAINT "parcelas_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "parcelas_pagamento_id_fkey" FOREIGN KEY ("pagamento_id") REFERENCES "pagamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pagamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "os_id" INTEGER NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "forma_pagamento" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "registrado_por_id" INTEGER NOT NULL,
    "conta_financeira_id" INTEGER,
    "categoria_financeira_id" INTEGER,
    CONSTRAINT "pagamentos_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_conta_financeira_id_fkey" FOREIGN KEY ("conta_financeira_id") REFERENCES "contas_financeiras" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_categoria_financeira_id_fkey" FOREIGN KEY ("categoria_financeira_id") REFERENCES "categorias_financeiras" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_pagamentos" ("data", "forma_pagamento", "id", "observacao", "os_id", "registrado_por_id", "valor_centavos") SELECT "data", "forma_pagamento", "id", "observacao", "os_id", "registrado_por_id", "valor_centavos" FROM "pagamentos";
DROP TABLE "pagamentos";
ALTER TABLE "new_pagamentos" RENAME TO "pagamentos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "contas_financeiras_nome_key" ON "contas_financeiras"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_financeiras_nome_key" ON "categorias_financeiras"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_pagamento_id_key" ON "parcelas"("pagamento_id");
