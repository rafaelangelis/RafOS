-- CreateTable
CREATE TABLE "pagamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "os_id" INTEGER NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "forma_pagamento" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "registrado_por_id" INTEGER NOT NULL,
    CONSTRAINT "pagamentos_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
