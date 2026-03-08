import { ZodError } from "zod";
import { HttpError } from "../errors/HttpError";
import { categoryRepository } from "../repositories/categoryRepository";
import { createCategorySchema, CreateCategoryInput, UpdateCategoryInput, updateCategorySchema } from "../schemas/categorySchema";

export const categoryService = {
  findAll: async (stockId: string) => {
    return await categoryRepository.findAll(stockId)
  },

  create: async (stockId: string, data: CreateCategoryInput) => {
    const validateData = createCategorySchema.parse(data)
    const nameConflict = await categoryRepository.findDuplicate(stockId, null, validateData)

    if (nameConflict) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['name'],
          message: "Você já tem uma categoria com esse nome."
        }
      ])
    }

    return await categoryRepository.create(stockId, validateData)
  },

  findById: async (stockId: string, categoryId: string,) => {
    const category = await categoryRepository.findById(stockId, categoryId)

    if (!category) {
      throw new HttpError(404, "Categoria não encontrada")
    }

    return category
  },

  update: async (stockId: string, categoryId: string, data: UpdateCategoryInput) => {
    const category = await categoryRepository.findById(stockId, categoryId)
    if (!category) throw new HttpError(404, "Categoria não encontrada.")

    const validateData = updateCategorySchema.parse(data)
    const nameConflict = await categoryRepository.findDuplicate(category.stockId, categoryId, validateData)

    if (nameConflict) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['name'],
          message: "Você já tem uma categoria com esse nome."
        }
      ])
    }

    return await categoryRepository.update(categoryId, validateData)
  },

  delete: async (stockId: string, categoryId: string) => {
    const category = await categoryRepository.findById(stockId, categoryId)

    if (!category) {
      throw new HttpError(404, "Categoria não encontrada.")
    }

    return await categoryRepository.delete(categoryId)
  },
}
