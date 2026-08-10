import { dashboardRepository } from "../repositories/dashboardRepository";

export const dashboardService = {
    getStats: async (stockId: string) => {
        const [totalDifferent, totalQty, lowStock, recentItems, topMovementsRaw, itemsByCategoryRaw, needsAttentionRaw] = await Promise.all([
            dashboardRepository.totalDifferentItems(stockId),
            dashboardRepository.totalQuantity(stockId),
            dashboardRepository.itemsWithLowStock(stockId, 10),
            dashboardRepository.recentItems(stockId, 10),
            dashboardRepository.topMovements(stockId),
            dashboardRepository.itemsByCategory(stockId),
            dashboardRepository.needsAttention(stockId),
        ])

        const topMovements = topMovementsRaw.map((item: any) => ({
            label: item.name,
            value: item._count.movements
        }))

        const itemsByCategory = itemsByCategoryRaw.map((cat: any) => ({
            label: cat.name,
            value: cat._count.items
        }))

        const needsAttention = needsAttentionRaw.map((item: any) => {
            const blacklist = ['id', 'stockId', 'createdAt', 'updatedAt', 'imagePublicId']
            const allFields = Object.keys(item)

            const fieldLabels: Record<string, string> = {
                imageUrl: "image",
                quantity: "quantity",
                categoryId: "category",
                priceInCents: "price",
                description: "description",
            }

            const missingFields = allFields.filter(key => {
                if (blacklist.includes(key)) return false

                const value = item[key as keyof typeof item]

                if (key === 'imageUrl') {
                    return value === null || value === undefined || value === ''
                }

                return (
                    value === null ||                  // O campo está nulo no banco
                    value === undefined ||             // O campo nem foi definido
                    (typeof value === 'string' && value.trim() === '') || // Texto vazio ou só espaços
                    (key === 'priceInCents' && value === 0) || // Preço está como zero (regra de negócio)
                    (key === "quantity" && value === 0)
                )
            }).map(key => fieldLabels[key] ?? key)

            return {
                id: item.id,
                name: item.name,
                missingFields
            }
        })

        return {
            totalDifferentItems: totalDifferent,
            totalQuantity: totalQty._sum.quantity,
            lowStockCount: lowStock.length,
            lowStockItems: lowStock,
            recentItems: recentItems,
            topMovements: topMovements,
            itemsByCategory: itemsByCategory,
            needsAttention: needsAttention
        }
    }
}