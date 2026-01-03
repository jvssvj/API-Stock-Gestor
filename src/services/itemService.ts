import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { Prisma } from "@prisma/client";
import {
  CreateItemDTO,
  createItemSchema,
  UpdateItemDTO,
} from "../schemas/ItemSchema";

export const updateItemSchema = createItemSchema.partial();

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

  findById(id: string) {
    const item = itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");
    return item;
  },

  update: async (id: string, data: UpdateItemDTO) => {
    const item = await itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);

    const updatedItem = await itemRepository.update(id, validatedData);
  },

  delete: async (id: string) => {
    const item = itemRepository.findById(id);
    if (!item) throw new HttpError(404, "Item não encontrado.");
    await itemRepository.delete(id);
  },
};

export default itemService;
