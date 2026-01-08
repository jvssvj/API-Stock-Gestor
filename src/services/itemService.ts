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

    return items;
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
    const item = await itemRepository.findById(itemId);

    if (!item) throw new HttpError(404, "Item não encontrado.");

    if (item.stock.userId !== userId) {
      throw new HttpError(
        403,
        "Acesso negado: Este item não pertence ao seu estoque"
      );
    }

    return item;
  },

  update: async (userId: string, itemId: string, data: unknown) => {
    const item = await itemRepository.findById(itemId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);

    if (item.stock.userId !== userId) {
      throw new HttpError(
        403,
        "Você não tem permissão para atualizar esse item!"
      );
    }

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          stock: { userId: userId },
        },
      });

      if (!category) {
        throw new HttpError(400, "Categoria inválida ou não pertence a você.");
      }
    }

    return await itemRepository.update(userId, itemId, validatedData);
  },

  delete: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    if (item.stock.userId !== userId) {
      throw new HttpError(
        403,
        "Você não tem permissão para excluir esse item!"
      );
    }

    return await itemRepository.delete(userId, itemId);
  },
};

export default itemService;
