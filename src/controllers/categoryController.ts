import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";

export const categoryController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.findAll(req.userId);
      return res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const category = await categoryService.create(req.userId, name);
      return res.status(201).json({ success: "Categoria cadastrada!", category });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.findById(req.params.id, req.userId);

      return res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedCategory = await categoryService.update(req.userId, req.params.id, req.body.name);
      return res.status(200).json({ updatedCategory });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await categoryService.delete(req.userId, req.params.id);
      return res.status(200).json({ success: "Categoria deletada com sucesso." });
    } catch (error) {
      next(error);
    }
  },
};
