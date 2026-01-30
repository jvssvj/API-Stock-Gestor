import { Prisma, User } from "@prisma/client";
import { prisma } from "../database";

export const userRepository = {
  findAll: async (): Promise<User[] | []> => {
    return prisma.user.findMany({ include: { stock: true } });
  },

  create: async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({ data });
  },

  findById: async (id: string): Promise<User | null> => {
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
