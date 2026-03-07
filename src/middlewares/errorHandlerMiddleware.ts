import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";
import { ZodError } from "zod";
import multer from "multer";

const errorHandlerMiddleware: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "Validation Error",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "O limite do arquivo é de 2MB." });
    }
    return res.status(400).json({ message: `Erro no upload: ${error.message}` });
  }

  if (error.code === "P2002") {
    const translations: Record<string, string> = {
      sku: "SKU",
      email: "E-mail",
      phone: "Telefone"
    };

    const fields = error.meta?.target as string[] || [];
    const filteredFields = fields.filter(field => field !== 'stockId');
    const target = filteredFields.map(f => translations[f] || f).join(", ");

    return res.status(409).json({ message: `Já existe um registro com este ${target}.`, });
  }

  return res.status(500).json({ message: "Internal server error." });
};

export default errorHandlerMiddleware