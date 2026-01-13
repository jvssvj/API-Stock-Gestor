import { NextFunction, Request, Response } from "express";
import itemService from "../services/itemService";

const itemControllers = {
  items: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await itemService.findAll(req.userId);
      return res.status(302).json({ items });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.findById(req.userId, req.params.id);
      return res.status(302).json({ item });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newItem = await itemService.create(req.userId, req.body);
      return res
        .status(200)
        .json({ message: "Item cadastrado com sucesso!", newItem });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedItem = await itemService.update(req.userId, id, req.body);
      return res
        .status(200)
        .json({ message: "Item atualizado com sucesso!", updatedItem });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await itemService.delete(req.userId, req.params.id);
      return res.status(200).json({ message: "Item deletado com sucesso!" });
    } catch (error) {
      next(error);
    }
  },
};

export default itemControllers;
