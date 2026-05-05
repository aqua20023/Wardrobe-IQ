import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export const validate =
  (schemas: RequestSchemas) => (req: Request, _res: Response, next: NextFunction) => {
    const errors: unknown[] = [];

    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (!parsed.success) errors.push(parsed.error.flatten());
      else req.body = parsed.data;
    }

    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (!parsed.success) errors.push(parsed.error.flatten());
      else req.params = parsed.data;
    }

    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (!parsed.success) errors.push(parsed.error.flatten());
      else req.query = parsed.data;
    }

    if (errors.length) {
      return next(new AppError("Validation failed", 400, errors));
    }

    next();
  };
