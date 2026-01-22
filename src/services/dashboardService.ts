import { prisma } from "../database";
import { dashboardRepository } from "../repositories/dashboardRepository";

export const dashboardService = {
    getStats: async (userId: string) => {
        const stock = await prisma.stock.findUnique({ where: { userId } })
        if (!stock) throw new Error("Estoque não encontrado");

        const [totalDifferent, totalQty, lowStock, recentItems] = await Promise.all([
            dashboardRepository.totalDifferentItems(stock.id),
            dashboardRepository.totalQuantity(stock.id),
            dashboardRepository.itemsWithLowStock(stock.id, 10),
            dashboardRepository.recentItems(stock.id, 10)
        ]);

        return {
            totalDifferentItems: totalDifferent,
            totalQuantity: totalQty,
            lowStockCount: lowStock.length,
            lowStockItems: lowStock,
            recentItems: recentItems
        };
    }
};