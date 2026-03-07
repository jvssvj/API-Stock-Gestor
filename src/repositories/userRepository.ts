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

  findConflict: async (id: string, email?: string, phone?: string) => {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined }
        ],
        NOT: { id: id }
      }
    })
  },

  update: async (id: string, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
