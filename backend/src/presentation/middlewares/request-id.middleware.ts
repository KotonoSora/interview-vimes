// src/presentation/middlewares/request-id.middleware.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export interface RequestWithId extends Request {
  id: string;
}

export function requestIdMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction,
): void {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as RequestWithId).id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
