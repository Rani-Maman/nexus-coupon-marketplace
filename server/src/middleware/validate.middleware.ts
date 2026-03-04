import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error_code: "VALIDATION_ERROR",
          message: err.errors.map((e) => e.message).join(", "),
        });
        return;
      }
      next(err);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error_code: "VALIDATION_ERROR",
          message: err.errors.map((e) => e.message).join(", "),
        });
        return;
      }
      next(err);
    }
  };
}

export const productIdParam = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});
