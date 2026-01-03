import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { Prisma } from "@prisma/client";
import {
  CreateItemDTO,
  createItemSchema,
  UpdateItemDTO,
  updateItemSchema,
} from "../schemas/ItemSchema";

const itemService = {
  findAll: async () => {
    const items = await itemRepository.findAll();
    if (!items) {
      throw new HttpError(404, "Nenhum item em estoque.");
    }

    return items;
  },

  create: async (item: CreateItemDTO, stockId: string) => {
    const validatedData = createItemSchema.parse(item);

    const prismaData: Prisma.ItemCreateInput = {
      ...validatedData,
      stock: {
        connect: { id: stockId },
      },
    };

    return itemRepository.create(prismaData);
  },

  findById: async (id: string) => {
    const item = await itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");
    return item;
  },

  update: async (id: string, data: UpdateItemDTO) => {
    const item = await itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);

    return await itemRepository.update(id, validatedData);
  },

  delete: async (id: string) => {
    const item = await itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");
    return await itemRepository.delete(id);
  },
};

export default itemService;
