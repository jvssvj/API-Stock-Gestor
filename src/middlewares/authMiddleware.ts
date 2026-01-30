import { Request, Response, NextFunction } from "express"
import * as jwt from "jsonwebtoken"
import { HttpError } from "../errors/HttpError"

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next(new HttpError(401, "Token não fornecido"))
  }

  const parts = authHeader.split(" ")
  if (parts.length !== 2) {
    return next(new HttpError(401, "Erro no token"))
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return next(new HttpError(401, "Token malformado"))
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return next(new HttpError(401, "Token inválido"))
    }

    req.userId = decoded.userId
    req.userName = decoded.userName
    return next()
  })
}
