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

        category: {
          select: {
            id: true,
            name: true
          }
        },
      },
    });
  },

  create: async (data: {
    name: string;
    quantity: number;
    priceInCents: number;
    sku: string;
    stockId: string;
    categoryId: string;
  }) => {
    return await prisma.item.create({
      data: {
        name: data.name,
        quantity: data.quantity,
        priceInCents: data.priceInCents,
        sku: data.sku,
        stock: { connect: { id: data.stockId } },
        category: { connect: { id: data.categoryId } },
      },
    });
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
        name: true,
        description: true,
        quantity: true,
        priceInCents: true,
        sku: true,
        createdAt: true,
        updatedAt: true,

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

  update: async (userId: string, id: string, data: any) => {
    return await prisma.item.update({
      where: {
        id: id,
        stock: { userId: userId },
      },
      data: {
        name: data.name,
        quantity: data.quantity,
        priceInCents: data.priceInCents,
        sku: data.sku,
        description: data.description,
        image: data.image,

        ...(data.categoryId && {
          category: {
            connect: { id: data.categoryId },
          },
        }),
      }
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
