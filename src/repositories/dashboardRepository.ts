import { prisma } from "../database"

export const dashboardRepository = {
    totalDifferentItems: async (stockId: string) => {
        return await prisma.item.count({
            where: { stockId }
        })
    },

    totalQuantity: async (stockId: string) => {
        const result = await prisma.item.aggregate({
            where: { stockId },
            _sum: { quantity: true }
        })

        return result._sum.quantity || 0
    },

    itemsWithLowStock: async (stockId: string, limit: number) => {
        return await prisma.item.findMany({
            where: { stockId, quantity: { lte: limit } },
            select: {
                id: true,
                name: true,
                quantity: true,
            }
        });
    },

    recentItems: async (stockId: string, take: number) => {
        return await prisma.item.findMany({
            where: { stockId },
            orderBy: {
                createdAt: 'desc'
            },
            take: take,
            select: {
                id: true,
                name: true,
                quantity: true,
                createdAt: true
            }
        })
    }
}