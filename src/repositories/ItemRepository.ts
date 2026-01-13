import { prisma } from "../database";

export const itemRepository = {
  findAll: async (userId: string) => {
    return await prisma.item.findMany({ where: { stock: { userId } } });
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

  findById: async (itemId: string) => {
    return await prisma.item.findUnique({
      where: { id: itemId },
      include: { stock: true },
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
      },
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
