import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { Prisma } from "@prisma/client";
import {
  CreateItemDTO,
  createItemSchema,
  UpdateItemDTO,
  updateItemSchema,
} from "../schemas/ItemSchema";
import { prisma } from "../database";

const itemService = {
  findAll: async (userId: string) => {
    const items = await itemRepository.findAll(userId);

    if (!items) {
      throw new HttpError(404, "Nenhum item em estoque.");
    }

    return items;
  },

  create: async (userId: string, item: unknown) => {
    const validatedData = createItemSchema.parse(item);

    const stock = await prisma.stock.findUnique({
      where: { userId },
    });

    if (!stock)
      throw new HttpError(404, "Estoque não encontrado para este usuário.");

    const prismaData: Prisma.ItemCreateInput = {
      ...validatedData,
      stock: {
        connect: {
          id: stock.id,
        },
      },
    };

    return itemRepository.create(prismaData);
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
