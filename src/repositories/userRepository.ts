import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const userRepository = {
  findAll: async () => {
    return prisma.user.findMany({ include: { stock: true } });
  },

  create: async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: { stock: true },
    });
  },

  update: async (id: string, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
