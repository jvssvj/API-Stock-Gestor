import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError";

interface TokenPayload {
  userId: string
  firstName: string
  lastName: string
  stockId: string
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) return next(new HttpError(401, "Token não fornecido"))

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token malformado ou inválido"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload

    req.userId = decoded.userId
    req.firstName = decoded.firstName
    req.lastName = decoded.lastName
    req.stockId = decoded.stockId

    return next()
  } catch (err) {
    return next(new HttpError(401, "Token inválido ou expirado"))
  }
}