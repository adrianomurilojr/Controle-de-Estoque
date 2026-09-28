import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

// Valida body/query/params contra schemas Zod antes de chegar ao controller
export function validate(schemas: ValidationTargets) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query) as any;
    if (schemas.params) req.params = schemas.params.parse(req.params) as any;
    next();
  };
}
