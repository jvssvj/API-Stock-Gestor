import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";
import { ZodError } from "zod";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error: Error | HttpError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    const { fieldErrors } = error.flatten();

    return res.status(400).json({
      status: "Validation Error",
      errors: fieldErrors,
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: "Internal server error." });
};
