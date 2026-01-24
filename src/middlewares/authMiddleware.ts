import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError(401, "Token não fornecido");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) throw new HttpError(401, "Erro no token");

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new HttpError(401, "Token malformado");
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) throw new HttpError(401, "Token inválido");

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    return next();
  });
};
