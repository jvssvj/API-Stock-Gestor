import { prisma } from "../database";
import { HttpError } from "../errors/HttpError";
import { categoryRepository } from "../repositories/categoryRepository";

export const categoryService = {
  findAll: async (userId: string) => {
    const categories = await categoryRepository.findAll(userId);

    if (categories.length === 0 || !categories) {
      throw new HttpError(404, "Nenhuma categoria encontrada!");
    }

    return categories;
  },

  create: async (userId: string, name: string) => {
    const stock = await prisma.stock.findUnique({ where: { userId } });

    if (!stock) {
      throw new HttpError(404, "Estoque não encontrado para este usuário.");
    }

    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, stockId: stock.id },
    });

    if (existingCategory) {
      throw new HttpError(400, "Você já tem uma categoria com esse nome.");
    }

    return await categoryRepository.create({ name, stockId: stock.id });
  },

  findById: async (id: string, userId: string) => {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new HttpError(404, "Categoria não encontrada");
    }

    return category;
  },

  update: async (userId: string, id: string, name: string) => {
    const category = await categoryRepository.findById(userId, id);

    if (!category) {
      throw new HttpError(404, "Categoria não encontrada.");
    }

    const nameExits = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        stockId: category.stockId,
        NOT: { id: id },
      },
    });

    if (nameExits) {
      throw new HttpError(400, "Já existe outra categoria com esse nome.");
    }

    return await categoryRepository.update(userId, id, { name });
  },

  delete: async (userId: string, id: string) => {
    const category = await categoryRepository.findById(userId, id);

    if (!category) {
      throw new HttpError(404, "Categoria não encontrada.");
    }

    return await categoryRepository.delete(userId, id);
  },
};
