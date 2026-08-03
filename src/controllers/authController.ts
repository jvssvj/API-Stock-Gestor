import { NextFunction, Request, Response } from "express"
import { authService } from "../services/authService"

export const authControllers = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      return res.status(200).json({ data: result })
    } catch (error) {
      next(error)
    }
  },

  requestOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.requestOtp(req.userId)
      return res.status(200).json({ message: "Código enviado para o seu e-mail." })
    } catch (error) {
      next(error)
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body)
      return res.status(200).json({ message: "Se esse e-mail estiver cadastrado, você receberá um código." })
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body)
      return res.status(200).json({ message: "Senha redefinida com sucesso." })
    } catch (error) {
      next(error)
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.verifyOtp(req.body)
      return res.status(200).json({ message: "Código válido." })
    } catch (error) {
      next(error)
    }
  },
}