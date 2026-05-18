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
    })
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message })
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "O limite do arquivo é de 2MB." })
    }
    return res.status(400).json({ message: `Erro no upload: ${error.message}` })
  }
  console.log(error)
  return res.status(500).json({ message: "Internal server error." })
}

export default errorHandlerMiddleware