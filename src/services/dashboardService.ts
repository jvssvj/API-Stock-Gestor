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

        // Transformamos o array bruto (Raw) que veio do banco em um novo array formatado
        const needsAttention = needsAttentionRaw.map(item => {

            // 🛡️ LISTA NEGRA: Definimos quais campos o usuário NÃO precisa preencher.
            // Ignoramos IDs e datas automáticas para que elas não apareçam como "faltando".
            const blacklist = ['id', 'stockId', 'createdAt', 'updatedAt'];

            // 🔍 INTROSPECÇÃO: O JS olha para o objeto 'item' e extrai o nome de todas as colunas.
            // Isso torna o código dinâmico: se o banco mudar, ele percebe as novas colunas aqui.
            const allFields = Object.keys(item);

            // 🧹 FILTRAGEM DE PENDÊNCIAS: Varremos todas as colunas em busca de "buracos".
            const missingFields = allFields.filter(key => {
                // Se a coluna atual estiver na lista negra, a gente pula (retorna false)
                if (blacklist.includes(key)) return false;

                // Pegamos o valor real que está dentro daquela coluna
                const value = item[key as keyof typeof item];

                // 🚨 CRITÉRIOS DE "VÁCUO":
                // Retornamos 'true' (campo faltando) se:
                return (
                    value === null ||                  // O campo está nulo no banco
                    value === undefined ||             // O campo nem foi definido
                    (typeof value === 'string' && value.trim() === '') || // Texto vazio ou só espaços
                    (key === 'priceInCents' && value === 0) // Preço está como zero (regra de negócio)
                );
            });

            // 🎁 RETORNO FORMATADO: Para cada item, devolvemos apenas o essencial para o Front.
            return {
                id: item.id,
                name: item.name,
                missingFields // Um array simples, ex: ["sku", "categoryId"]
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