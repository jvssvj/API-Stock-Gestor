import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { CreateItemRepositoryDTO, UpdateItemRepositoryDTO } from "../schemas/ItemSchema";

export const itemRepository = {
  findAll: async (userId: string) => {
    return await prisma.item.findMany({
      where: {
        stock: { userId }
      },

      select: {
        id: true,
        name: true,
        quantity: true,
        priceInCents: true,

        category: {
          select: {
            id: true,
            name: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  create: async (data: CreateItemRepositoryDTO) => {
    return await prisma.item.create({ data });
  },

  findById: async (itemId: string, userId: string) => {
    return await prisma.item.findUnique({
      where: {
        id: itemId,
        stock: {
          userId: userId
        }
      },

      select: {
        id: true,
        imageUrl: true,
        imagePublicId: true,
        name: true,
        description: true,
        quantity: true,
        priceInCents: true,
        sku: true,
        createdAt: true,
        updatedAt: true,
        stockId: true,

        category: {
          select: {
            id: true,
            name: true
          }
        },

        movements: {
          select: {
            id: true,
            userName: true,
            reason: true,
            changes: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
        }
      }
    });
  },

  update: async (ItemId: string, userId: string, data: UpdateItemRepositoryDTO) => {
    return await prisma.item.update({
      where: {
        id: ItemId,
        stock: { userId: userId },
      },
      data,
    });
  },

  delete: async (userId: string, itemId: string) => {
    return await prisma.item.delete({
      where: {
        id: itemId,
        stock: { userId: userId },
      },
    });
  },
};
