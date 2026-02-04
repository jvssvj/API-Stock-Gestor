import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError";

interface TokenPayload {
  userId: string;
  userName: string;
  stockId: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return next(new HttpError(401, "Token não fornecido"));

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token malformado ou inválido"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    req.stockId = decoded.stockId;

    return next();
  } catch (err) {
    return next(new HttpError(401, "Token inválido ou expirado"));
  }
};