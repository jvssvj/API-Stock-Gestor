import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { createItemSchema, updateItemSchema } from "../schemas/ItemSchema";
import { prisma } from "../database";
import { cloudinaryService } from "./cloudinaryService";

const itemService = {
  findAll: async (userId: string) => {
    const items = await itemRepository.findAll(userId);

    if (!items || items.length === 0) {
      throw new HttpError(404, "Nenhum item em estoque.");
    }

    return items
  },

  create: async (userId: string, itemData: any, file?: Express.Multer.File) => {
    const validatedData = createItemSchema.parse(itemData);

    const stock = await prisma.stock.findUnique({
      where: { userId },
    });
    if (!stock) throw new Error("Estoque não encontrado");


    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          stockId: stock.id,
        },
      });
      if (!category) throw new Error("Categoria inválida ou não pertence a este usuário");
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (file) {
      const folder = `stock-gestor/stocks/${stock.id}/items`;

      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as { url: string, publicId: string };

      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const savedItem = await itemRepository.create({
      ...validatedData,
      stockId: stock.id,
      categoryId: validatedData.categoryId,
      imageUrl: imageUrl ?? null,
      imagePublicId: imagePublicId ?? null,
    });

    return {
      id: savedItem.id,
      name: savedItem.name,
      quantity: savedItem.quantity
    };
  },

  findById: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    return item
  },

  update: async (userId: string, itemId: string, data: any, userName: string, file?: Express.Multer.File) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);
    const { reason, ...updates } = validatedData as any;

    let imageUrl = item.imageUrl;
    let imagePublicId = item.imagePublicId;

    if (file) {
      if (item.imagePublicId) {
        await cloudinaryService.delete(item.imagePublicId);
      }

      const folder = `stock-gestor/stocks/${item.stockId}/items`;
      const uploadResult = await cloudinaryService.upload(file.buffer, folder) as any;

      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const changes: any[] = [];
    const fieldsToTrack = ['name', 'quantity', 'priceInCents', 'sku', 'categoryId'];

    fieldsToTrack.forEach((field) => {
      const oldValue = (item as any)[field];
      const newValue = (updates as any)[field];

      if (newValue !== undefined && newValue !== oldValue) {
        changes.push({
          field,
          oldValue: String(oldValue ?? "Vazio"),
          newValue: String(newValue)
        });
      }
    });

    if (file) {
      changes.push({ field: 'image', oldValue: item.imageUrl ? 'Sim' : 'Não', newValue: 'Sim' });
    }

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, stock: { userId } },
      });
      if (!category) throw new HttpError(400, "Categoria inválida.");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedItem = await itemRepository.update(itemId, userId, {
        ...updates,
        imageUrl,
        imagePublicId,
        categoryId: updates.categoryId
      });

      if (changes.length > 0) {
        await tx.stockMovement.create({
          data: {
            itemId,
            userId,
            userName,
            reason: reason || "Edição de dados",
            changes
          }
        });
      }

      return updatedItem;
    });
  },

  delete: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId);
    if (!item) throw new HttpError(404, "Item não encontrado.");

    if (item.imagePublicId) {
      await cloudinaryService.delete(item.imagePublicId)
    }

    return await itemRepository.delete(userId, itemId);
  },
};

export default itemService;
