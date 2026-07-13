import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = "admin@rafos.local";
  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário admin já existe (${email}), nada a fazer.`);
    return;
  }

  const senhaHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email,
      senhaHash,
      role: "admin",
    },
  });

  console.log(`Usuário admin criado: ${email} / senha: admin123`);
  console.log("IMPORTANTE: troque essa senha assim que fizer o primeiro login.");
}

async function seedFormasPagamento() {
  const padrao = ["Dinheiro", "Pix", "Cartão de Crédito", "Cartão de Débito", "Boleto"];

  for (const nome of padrao) {
    await prisma.formaPagamento.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  console.log("Formas de pagamento padrão garantidas.");
}

async function seedContasFinanceiras() {
  await prisma.contaFinanceira.upsert({
    where: { nome: "Caixa" },
    update: {},
    create: { nome: "Caixa" },
  });

  console.log("Conta financeira padrão (Caixa) garantida.");
}

async function main() {
  await seedAdmin();
  await seedFormasPagamento();
  await seedContasFinanceiras();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
