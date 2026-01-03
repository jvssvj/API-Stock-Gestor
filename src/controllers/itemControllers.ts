import { NextFunction, Request, Response } from "express";
import itemService from "../services/itemService";

const itemControllers = {
  items: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await itemService.findAll();
      return res.status(302).json({ items });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.findById(req.params.id);
      return res.status(302).json({ item });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { stockId } = req.params;
      const item = await itemService.create(req.body, stockId);
      return res
        .status(200)
        .json({ message: "Item cadastrado com sucesso!", item });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedItem = await itemService.update(req.params.id, req.body);
      return res
        .status(200)
        .json({ message: "Item atualizado com sucesso!", updatedItem });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedItem = await itemService.delete(req.params.id);
      return res
        .status(200)
        .json({ message: "Item deletado com sucesso!", deletedItem });
    } catch (error) {
      next(error);
    }
  },
};

export default itemControllers;
