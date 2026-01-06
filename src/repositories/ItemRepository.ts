import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const itemRepository = {
  findAll: async (userId: string) => {
    return await prisma.item.findMany({ where: { stock: { userId } } });
  },

  create: async (data: Prisma.ItemCreateInput) =>
    await prisma.item.create({ data }),

  findById: async (itemId: string) => {
    return await prisma.item.findUnique({
      where: { id: itemId },
      include: { stock: true },
    });
  },

  update: async (userId: string, id: string, data: Prisma.ItemUpdateInput) => {
    return await prisma.item.update({
      where: {
        id: id,
        stock: { userId: userId },
      },
      data,
    });
  },

  delete: async (userId: string, id: string) => {
    return await prisma.item.delete({
      where: {
        id: id,
        stock: { userId: userId },
      },
    });
  },
};
