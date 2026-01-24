import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { updateItemSchema } from "../schemas/ItemSchema";
import { prisma } from "../database";

const itemService = {
  findAll: async (userId: string) => {
    const items = await itemRepository.findAll(userId);

    if (!items) {
      throw new HttpError(404, "Nenhum item em estoque.");
    }

    return items
  },

  create: async (userId: string, itemData: any) => {
    const stock = await prisma.stock.findUnique({
      where: { userId },
    });

    if (!stock) throw new Error("Estoque não encontrado");

    const category = await prisma.category.findFirst({
      where: {
        id: itemData.categoryId,
        stockId: stock.id,
      },
    });

    if (!category) {
      throw new Error("Categoria inválida ou não pertence a este usuário");
    }

    return await itemRepository.create({
      ...itemData,
      stockId: stock.id,
      categoryId: category.id,
    });
  },

  findById: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    return item
  },

  update: async (userId: string, itemId: string, data: unknown, userName: string) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);
    const { reason, ...updates } = validatedData as any;

    const changes: any[] = [];
    const fieldsToTrack = ['name', 'quantity', 'priceInCents', 'sku', 'categoryId'];

    fieldsToTrack.forEach((field) => {
      const oldValue = (item as any)[field];
      const newValue = (updates as any)[field];

      if (newValue !== undefined && newValue !== oldValue) {
        changes.push({
          field: field,
          oldValue: String(oldValue ?? "Vazio"),
          newValue: String(newValue)
        });
      }
    });

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          stock: { userId: userId },
        },
      });
      if (!category) throw new HttpError(400, "Categoria inválida.");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: updates,
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true
        }
      });

      if (changes.length > 0) {
        await tx.stockMovement.create({
          data: {
            itemId,
            userId,
            userName: userName,
            reason: reason,
            changes: changes
          }
        });
      }

      return updatedItem;
    });
  },

  delete: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    return await itemRepository.delete(userId, itemId);
  },
};

export default itemService;
