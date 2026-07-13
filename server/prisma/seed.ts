import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
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

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
