import { prisma } from "../database";
import { dashboardRepository } from "../repositories/dashboardRepository";

export const dashboardService = {
    getStats: async (userId: string) => {
        const stock = await prisma.stock.findUnique({ where: { userId } })
        if (!stock) throw new Error("Estoque não encontrado");

        const [totalDifferent, totalQty, lowStock, recentItems, topMovementsRaw, itemsByCategoryRaw, needsAttentionRaw] = await Promise.all([
            dashboardRepository.totalDifferentItems(stock.id),
            dashboardRepository.totalQuantity(stock.id),
            dashboardRepository.itemsWithLowStock(stock.id, 10),
            dashboardRepository.recentItems(stock.id, 10),
            dashboardRepository.topMovements(stock.id),
            dashboardRepository.itemsByCategory(stock.id),
            dashboardRepository.needsAttention(stock.id),
        ]);

        const topMovements = topMovementsRaw.map(item => ({
            label: item.name,
            value: item._count.movements
        }))

        const itemsByCategory = itemsByCategoryRaw.map(cat => ({
            label: cat.name,
            value: cat._count.items
        }));

        const needsAttention = needsAttentionRaw.map(item => {
            const blacklist = ['id', 'stockId', 'createdAt', 'updatedAt', 'imagePublicId'];
            const allFields = Object.keys(item);

            const missingFields = allFields.filter(key => {
                if (blacklist.includes(key)) return false;

                const value = item[key as keyof typeof item];

                if (key === 'imageUrl') {
                    return value === null || value === undefined || value === '';
                }

                return (
                    value === null ||                  // O campo está nulo no banco
                    value === undefined ||             // O campo nem foi definido
                    (typeof value === 'string' && value.trim() === '') || // Texto vazio ou só espaços
                    (key === 'priceInCents' && value === 0) // Preço está como zero (regra de negócio)
                );
            });

            return {
                id: item.id,
                name: item.name,
                missingFields
            };
        });

        return {
            totalDifferentItems: totalDifferent,
            totalQuantity: totalQty._sum.quantity,
            lowStockCount: lowStock.length,
            lowStockItems: lowStock,
            recentItems: recentItems,
            topMovements: topMovements,
            itemsByCategory: itemsByCategory,
            needsAttention: needsAttention
        };
    }
};