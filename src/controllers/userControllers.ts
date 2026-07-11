import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService";

export const userControllers = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await userService.create(req.body)
      return res.status(201).json({ message: "Usuário cadastrado com sucesso!", data: newUser })
    } catch (error) {
      next(error)
    }
  },

  findMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findMe(req.userId)
      return res.status(200).json({ message: "Usuário encontrado!", data: user })
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await userService.update(req.userId, req.body, req.file)
      return res.status(200).json({ message: "Usuário atualizado com sucesso!", data: updatedUser })
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.delete(req.userId)
      return res.status(200).json({ message: "Usuário deletado com sucesso!" })
    } catch (error) {
      next(error)
    }
  },
}
