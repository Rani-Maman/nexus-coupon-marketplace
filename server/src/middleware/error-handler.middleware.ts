import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error_code: err.errorCode,
      message: err.message,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error_code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}
