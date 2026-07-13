-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "endereco" TEXT,
    "cpf_cnpj" TEXT,
    "observacoes" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numero_serie" TEXT,
    "senha_acesso" TEXT,
    "acessorios" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "equipamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente_id" INTEGER NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "tecnico_responsavel_id" INTEGER,
    "defeito_relatado" TEXT NOT NULL,
    "diagnostico" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "valor_orcamento_centavos" INTEGER,
    "valor_pecas_centavos" INTEGER,
    "valor_mao_obra_centavos" INTEGER,
    "valor_total_centavos" INTEGER,
    "forma_pagamento" TEXT,
    "data_abertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_previsao" DATETIME,
    "data_conclusao" DATETIME,
    "data_entrega" DATETIME,
    "observacoes" TEXT,
    CONSTRAINT "ordens_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_tecnico_responsavel_id_fkey" FOREIGN KEY ("tecnico_responsavel_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historico_status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "os_id" INTEGER NOT NULL,
    "status_anterior" TEXT,
    "status_novo" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    CONSTRAINT "historico_status_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "historico_status_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
