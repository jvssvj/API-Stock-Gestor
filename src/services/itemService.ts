import { HttpError } from "../errors/HttpError";
import { itemRepository } from "../repositories/ItemRepository";
import { CreateItemInput, createItemSchema, UpdateItemInput, updateItemSchema } from "../schemas/ItemSchema";
import { prisma } from "../database";
import { cloudinaryService } from "./cloudinaryService";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const itemService = {
  findAll: async (userId: string, page: number, limit: number) => {
    return await itemRepository.findAll(userId, page, limit)
  },

  create: async (userId: string, itemData: CreateItemInput, file?: Express.Multer.File) => {
    const stock = await prisma.stock.findUnique({ where: { userId } })
    if (!stock) throw new HttpError(404, "Estoque não encontrado")

    const validatedData = createItemSchema.safeParse(itemData)
    const categoryId = itemData.categoryId

    const [category, skuInUse] = await Promise.all([
      categoryId
        ? prisma.category.findFirst({ where: { id: categoryId, stockId: stock.id } })
        : Promise.resolve(true),
      itemData.sku
        ? prisma.item.findFirst({ where: { sku: itemData.sku, stockId: stock.id } })
        : Promise.resolve(null),
    ])


    const issues: { code: "custom"; path: string[]; message: string }[] = []

    if (!validatedData.success) {
      issues.push(...validatedData.error.issues as any)
    }


    if (categoryId && !category) {
      issues.push({ code: "custom", path: ["categoryId"], message: "Categoria inválida ou não pertence a este usuário." })
    }

    if (skuInUse) {
      issues.push({ code: "custom", path: ["sku"], message: "Este SKU já está em uso." })
    }

    if (issues.length > 0) throw new ZodError(issues)

    const { categoryId: catId, ...rest } = validatedData.data!


    let imageUrl: string | null = null
    let imagePublicId: string | null = null

    if (file) {
      const folder = `stock-gestor/stocks/${stock.id}/items`
      const uploadResult = await cloudinaryService.upload(file.buffer, folder)
      imageUrl = uploadResult.url
      imagePublicId = uploadResult.publicId
    }

    const data = {
      ...rest,
      stock: { connect: { id: stock.id } },
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      imageUrl,
      imagePublicId,
    }

    const savedItem = await itemRepository.create(data)

    return {
      id: savedItem.id,
      name: savedItem.name,
      sku: savedItem.sku,
      quantity: savedItem.quantity,
    }
  },

  findById: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId)
    if (!item) throw new HttpError(404, "Item não encontrado.")

    return item
  },

  update: async (userId: string, itemId: string, data: UpdateItemInput, userName: string, file?: Express.Multer.File) => {
    const item = await itemRepository.findById(itemId, userId)
    if (!item) throw new HttpError(404, "Item não encontrado.")

    const validatedData = updateItemSchema.parse(data)
    const { reason, categoryId, ...updates } = validatedData

    const fieldsToTrack = ["name", "quantity", "priceInCents", "sku"] as const;

    const hasChanges =
      fieldsToTrack.some((field) => {
        const newValue = updates[field];
        return newValue !== undefined && String(newValue) !== String(item[field]);
      }) ||
      (categoryId !== undefined && categoryId !== item.category?.id) ||
      !!file;

    if (!hasChanges) {
      throw new ZodError([{
        code: "custom",
        path: ["form"],
        message: "Atualize pelo menos um campo para atualizar.",
      }]);
    }

    const [category, skuInUse] = await Promise.all([
      categoryId
        ? prisma.category.findFirst({ where: { id: categoryId, stock: { userId } } })
        : Promise.resolve(true),
      updates.sku && updates.sku !== item.sku
        ? prisma.item.findFirst({ where: { sku: updates.sku, stockId: item.stockId, NOT: { id: itemId } } })
        : Promise.resolve(null),
    ])

    const issues: { code: "custom"; path: string[]; message: string }[] = [];

    if (categoryId && !category) {
      issues.push({ code: "custom", path: ["categoryId"], message: "Categoria inválida." })
    }

    if (skuInUse) {
      issues.push({ code: "custom", path: ["sku"], message: "Este SKU já está em uso." })
    }

    if (issues.length > 0) throw new ZodError(issues)

    let imageUrl = item.imageUrl
    let imagePublicId = item.imagePublicId

    if (file) {
      if (item.imagePublicId) await cloudinaryService.delete(item.imagePublicId)
      const folder = `stock-gestor/stocks/${item.stockId}/items`
      const uploadResult = await cloudinaryService.upload(file.buffer, folder)
      imageUrl = uploadResult.url
      imagePublicId = uploadResult.publicId
    }

    const changes: { field: string; oldValue: string; newValue: string }[] = []

    fieldsToTrack.forEach((field) => {
      const newValue = updates[field]
      if (newValue !== undefined && String(newValue) !== String(item[field])) {
        changes.push({
          field,
          oldValue: String(item[field] ?? "Vazio"),
          newValue: String(newValue),
        })
      }
    })

    if (categoryId && categoryId !== item.category?.id) {
      changes.push({ field: "categoryId", oldValue: item.category?.id ?? "Vazio", newValue: categoryId })
    }

    if (file) {
      changes.push({ field: "image", oldValue: item.imageUrl ? "Sim" : "Não", newValue: "Sim" })
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: {
          ...updates,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
          imageUrl,
          imagePublicId,
        },
      });

      if (changes.length > 0) {
        await tx.stockMovement.create({
          data: {
            itemId,
            userId,
            userName,
            reason: reason || "Edição de dados",
            changes,
          },
        });
      }

      return updatedItem;
    })
  },

  delete: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId, userId)
    if (!item) throw new HttpError(404, "Item não encontrado.")

    if (item.imagePublicId) {
      await cloudinaryService.delete(item.imagePublicId)
    }

    return await itemRepository.delete(userId, itemId)
  },
}

export default itemService
