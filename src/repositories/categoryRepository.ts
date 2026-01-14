import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const categoryRepository = {
  findAll: async (userId: string) => {
    return await prisma.category.findMany({
      where: { stock: { userId: userId } },
      orderBy: { name: "asc" },
    });
  },

  create: async (data: { name: string; stockId: string }) => {
    return await prisma.category.create({
      data: {
        name: data.name,
        stock: { connect: { id: data.stockId } },
      },
    });
  },

  findById: async (userId: string, id: string) => {
    return await prisma.category.findUnique({ where: { id, stock: {userId: userId}} });
  },

  update: async (
    userId: string,
    id: string,
    data: Prisma.CategoryUpdateInput
  ) => {
    return await prisma.category.update({
      where: { id: id, stock: { userId: userId } },
      data,
    });
  },

  delete: async (userId: string, id: string) => {
    return await prisma.category.delete({
      where: { id: id, stock: { userId: userId } },
    });
  },
};
