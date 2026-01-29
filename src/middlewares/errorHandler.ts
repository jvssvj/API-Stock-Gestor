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
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "O arquivo é muito grande! O limite é de 2MB." });
    }
    return res.status(400).json({ error: `Erro no upload: ${error.message}` });
  }

  return res.status(500).json({ error: "Internal server error." });
};

export default errorHandlerMiddleware