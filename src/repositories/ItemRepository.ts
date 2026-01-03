import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const itemRepository = {
  findAll: async () => await prisma.item.findMany(),

  create: async (data: Prisma.ItemCreateInput) =>
    await prisma.item.create({ data }),

  findById: async (id: string) =>
    await prisma.item.findUnique({ where: { id } }),

  update: async (id: string, data: Prisma.ItemUpdateInput) =>
    await prisma.item.update({ where: { id }, data }),

  delete: async (id: string) => await prisma.item.delete({ where: { id } }),
};
