import { Prisma } from "@prisma/client";
import { prisma } from "../database";

export const stockMovementRepository = {
    create: async (data: any, tx: Prisma.TransactionClient) => {
        return await tx.stockMovement.create({ data })
    },

    findByItem: async (itemId: string) => {
        return await prisma.stockMovement.findMany({
            where: { itemId },
            orderBy: { createdAt: 'desc' }
        })
    }
};