import { HttpError } from "../errors/HttpError";
import { categoryRepository } from "../repositories/categoryRepository";
import { createCategorySchema, CreateCategoryInput, UpdateCategoryInput, updateCategorySchema } from "../schemas/categorySchema";

export const categoryService = {
  findAll: async (stockId: string) => {
    return await categoryRepository.findAll(stockId)
  },

  create: async (stockId: string, data: CreateCategoryInput) => {
    const validateData = createCategorySchema.parse(data)

    const conflict = await categoryRepository.findDuplicate(stockId, null, validateData)

    if (conflict) {
      if (conflict.name.toLowerCase() === validateData.name.toLowerCase()) {
        throw new HttpError(400, "Você já tem uma categoria com esse nome.")
      }
      if (conflict.color.toLowerCase() === validateData.color.toLowerCase()) {
        throw new HttpError(400, "Você já escolheu essa cor para outra categoria.")
      }
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

    const conflict = await categoryRepository.findDuplicate(category.stockId, categoryId, validateData)

    if (conflict) {
      if (validateData.name && conflict.name.toLowerCase() === validateData.name.toLowerCase()) {
        throw new HttpError(400, "Você já tem uma categoria com esse nome.")
      }
      if (validateData.color && conflict.color.toLowerCase() === validateData.color.toLowerCase()) {
        throw new HttpError(400, "Você já escolheu essa cor para outra categoria.")
      }
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
