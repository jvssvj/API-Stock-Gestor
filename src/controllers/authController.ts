import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";

export const authControllers = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  },
}
