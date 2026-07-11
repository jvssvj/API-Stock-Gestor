import { Prisma } from "@prisma/client";
import { prisma } from "../database";

const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  avatarUrl: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect

export const userRepository = {
  create: async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({
      data,
      select: publicUserSelect,
    })
  },

  findMe: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        avatarPublicId: true,
        stock: true,
      },
    })
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email }
    })
  },

  findConflict: async (id: string, email?: string, phone?: string) => {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined }
        ],
        NOT: { id: id }
      },
      select: {
        email: true,
        phone: true,
      },
    })
  },

  update: async (id: string, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    })
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } })
  },
}
