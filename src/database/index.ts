import { PrismaClient } from "@prisma/client";

// Isso garante que você tenha apenas uma instância do Prisma rodando
export const prisma = new PrismaClient();
