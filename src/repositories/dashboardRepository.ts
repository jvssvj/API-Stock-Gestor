import { prisma } from "../database";

export const dashboardRepository = {
    totalDifferentItems: async (stockId: string) => {
        return await prisma.item.count({
            where: { stockId }
        })
    },

    totalQuantity: async (stockId: string) => {
        return await prisma.item.aggregate({
            where: { stockId },
            _sum: { quantity: true }
        })
    },

    itemsWithLowStock: async (stockId: string, limit: number) => {
        return await prisma.item.findMany({
            where: { stockId, quantity: { lte: limit } },
            select: {
                id: true,
                name: true,
                quantity: true,
            }
        })
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
    },

    topMovements: async (stockId: string) => {
        return await prisma.item.findMany({
            where: { stockId },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { movements: true }
                }
            },
            orderBy: {
                movements: {
                    _count: 'desc'
                }
            },
            take: 5
        })
    },

    itemsByCategory: async (stockId: string) => {
        return await prisma.category.findMany({
            where: {
                items: {
                    some: { stockId }
                }
            },
            select: {
                name: true,
                _count: {
                    select: {
                        items: {
                            where: { stockId }
                        }
                    }
                }
            },
            take: 5
        })
    },

    needsAttention: async (stockId: string) => {
        return await prisma.item.findMany({
            where: {
                stockId,
                OR: [
                    { description: null },
                    { description: "" },
                    { imageUrl: null },
                    { categoryId: null },
                    { priceInCents: 0 },
                    { quantity: 0 }
                ]
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                quantity: true,
                description: true,
                sku: true,
                imageUrl: true,
                categoryId: true,
                priceInCents: true
            }
        })
    }
}