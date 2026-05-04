import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";
import { paginationSchema } from "../schemas/paginationSchema";

export const categoryController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = paginationSchema.parse(req.query)
      const { categories, total } = await categoryService.findAll(req.stockId, page, limit)
      const totalPages = Math.ceil(total / limit)

      return res.status(200).json({
        data: categories,
        meta: { totalItems: total, totalPages, currentPage: page },
      })
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.create(req.stockId, req.body)
      return res.status(201).json({ message: "Categoria cadastrada!", data: category })
    } catch (error) {
      next(error)
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const category = await categoryService.findById(req.stockId, req.params.id)

      return res.status(200).json({ data: category })
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedCategory = await categoryService.update(req.stockId, req.params.id, req.body)
      return res.status(200).json({ data: updatedCategory })
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await categoryService.delete(req.stockId, req.params.id)
      return res.status(200).json({ message: "Categoria deletada com sucesso." })
    } catch (error) {
      next(error)
    }
  },
}
