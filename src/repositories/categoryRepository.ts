import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/categorySchema";

export const categoryRepository = {
  findAll: async (stockId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit
    const where = { stockId }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ])

    return { categories, total }
  },

  create: async (stockId: string, data: CreateCategoryInput) => {
    return await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        iconName: data.iconName,
        stock: {
          connect: { id: stockId }
        }
      }
    })
  },

  findById: async (stockId: string, categoryId: string) => {
    return await prisma.category.findUnique({
      where: {
        id: categoryId,
        stockId
      }
    })
  },

  findDuplicate: async (stockId: string, idToIgnore: string | null, data: { name?: string }) => {
    const conditions: Prisma.CategoryWhereInput[] = []

    if (data.name) {
      conditions.push({ name: { equals: data.name, mode: 'insensitive' as Prisma.QueryMode } })
    }

    if (conditions.length === 0) return null

    return await prisma.category.findFirst({
      where: {
        stockId: stockId,
        ...(idToIgnore && { NOT: { id: idToIgnore } }),
        OR: conditions
      }
    })
  },

  update: async (categoryId: string, data: UpdateCategoryInput) => {
    return await prisma.category.update({
      where: { id: categoryId },
      data,
    })
  },

  delete: async (categoryId: string) => {
    return await prisma.category.delete({
      where: { id: categoryId },
    })
  },
}
