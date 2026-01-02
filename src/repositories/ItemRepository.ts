import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const itemRepository = {
  findAll: () => prisma.item.findMany(),

  create: (data: Prisma.ItemCreateInput) => prisma.item.create({ data }),

  findById: (id: string) => {
    const item = prisma.item.findUnique({ where: { id } });
    return item;
  },

  update: (id: string, data: Prisma.ItemCreateInput) => {
    const updatedItem = prisma.item.update({ where: { id }, data });
  },

  delete: (id: string) => prisma.item.delete({ where: { id } }),
};
