import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";

export const userControllers = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.findAll()
      return res.status(302).json({ users })
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await createUserSchema.parseAsync(req.body)
      const newUser = await userService.create(validatedData)

      return res
        .status(201)
        .json({ success: "Usuário cadastrado com sucesso!", newUser })
    } catch (error) {
      next(error)
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findById(req.params.id)
      return res.status(302).json({ success: "Usuário encontrado!", user })
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await updateUserSchema.parseAsync(req.body)
      const updatedUser = await userService.update(req.params.id, validatedData, req.file)

      return res
        .status(201)
        .json({ success: "Usuário atualizado com sucesso!", updatedUser })
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.delete(req.params.id)
      return res.status(201).json({ success: "Usuário deletado com sucesso!" })
    } catch (error) {
      next(error)
    }
  },
}
