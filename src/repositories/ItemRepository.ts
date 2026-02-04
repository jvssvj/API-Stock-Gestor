import { Prisma } from "@prisma/client";
import { prisma } from "../database";

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
        sku: true,
        description: true,

        category: {
          select: {
            id: true,
            name: true,
            color: true,
            iconName: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  create: async (data: Prisma.ItemCreateInput) => {
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

  update: async (ItemId: string, userId: string, data: Prisma.ItemUpdateInput) => {
    return await prisma.item.update({ where: { id: ItemId, }, data, });
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
