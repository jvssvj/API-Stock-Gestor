import { NextFunction, Request, Response } from "express";
import itemService from "../services/itemService";
import { paginationSchema } from "../schemas/paginationSchema";

const itemControllers = {
  items: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = paginationSchema.parse(req.query)
      const { items, total } = await itemService.findAll(req.userId, page, limit)
      const totalPages = Math.ceil(total / limit)

      return res.status(200).json({
        data: items,
        meta: { totalItems: total, totalPages, currentPage: page },
      })
    } catch (error) {
      next(error)
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.findById(req.userId, req.params.id)
      return res.status(200).json({ data: item })
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newItem = await itemService.create(req.userId, req.body, req.file)
      return res.status(201).json({ message: "Item cadastrado com sucesso!", data: newItem })
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.userId
      const userName = req.userName

      const updatedItem = await itemService.update(
        userId,
        id,
        req.body,
        userName,
        req.file
      )

      return res.status(200).json({ message: "Item atualizado com sucesso!", data: updatedItem, })
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await itemService.delete(req.userId, req.params.id)
      return res.status(200).json({ message: "Item deletado com sucesso!" })
    } catch (error) {
      next(error)
    }
  },
}

export default itemControllers
