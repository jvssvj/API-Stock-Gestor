import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService";

export const userControllers = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.findAll();
      return res.status(302).json({ users });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await userService.create(req.body);

      return res
        .status(201)
        .json({ success: "Usuário cadastrado com sucesso!", newUser });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findById(req.params.id);
      return res.status(302).json({ success: "Usuário encontrado!", user });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await userService.update(req.params.id, req.body);

      return res
        .status(201)
        .json({ success: "Usuário atualizado com sucesso!", updatedUser });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.delete(req.params.id);
      return res.status(201).json({ success: "Usuário deletado com sucesso!" });
    } catch (error) {
      next(error);
    }
  },
};
