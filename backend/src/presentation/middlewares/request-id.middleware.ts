// src/presentation/middlewares/request-id.middleware.ts
import { randomUUID } from "crypto";

import { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingId = req.headers["x-request-id"] as string;
  const traceId =
    incomingId && incomingId.trim().length > 0 ? incomingId : randomUUID();

  req.id = traceId;
  res.setHeader("X-Request-Id", traceId);

  next();
}
