import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../utils/AppError";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  const appError = error instanceof AppError ? error : new AppError("Internal server error", 500);

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    details: appError.details,
    stack: env.NODE_ENV === "development" ? error.stack : undefined
  });
}
