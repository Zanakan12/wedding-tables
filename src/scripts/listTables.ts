// scripts/listTables.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.table.findMany();
  console.log(tables);
}

main();
