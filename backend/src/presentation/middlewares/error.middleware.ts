// src/presentation/middlewares/error.middleware.ts
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { DomainException } from "#/domain/exceptions/domain.exception";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = req.id || (req.headers["x-request-id"] as string) || "";
  const message =
    err?.message || "Đã xảy ra lỗi trong quá trình xử lý chứng từ.";

  if (traceId) {
    res.setHeader("X-Request-Id", traceId);
  }

  // 1. Zod Validation Errors (HTTP 400)
  if (
    err instanceof ZodError ||
    err?.name === "ZodError" ||
    Array.isArray(err?.issues)
  ) {
    res.status(400).json({
      success: false,
      message: "Lỗi xác thực dữ liệu đầu vào (Validation Error)",
      requestId: traceId,
      errors:
        err.issues?.map((issue: any) => ({
          path: issue.path.join("."),
          message: issue.message,
        })) ??
        err.errors ??
        [],
    });
    return;
  }

  // 2. Unprocessable Entity / Business Rule Violation (HTTP 422)
  if (
    err?.name === "DomainValidationError" ||
    err?.name === "DomainUnprocessableError" ||
    err?.status === 422
  ) {
    res.status(422).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 3. Duplicate / Conflict (HTTP 409)
  if (
    err?.name === "DomainConflictError" ||
    err?.name === "ConcurrencyConflictError" ||
    message.includes("đã tồn tại") ||
    err?.status === 409
  ) {
    res.status(409).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 4. Not Found (HTTP 404)
  if (
    err?.name === "EntityNotFoundError" ||
    message.includes("Không tìm thấy") ||
    err?.status === 404
  ) {
    res.status(404).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 5. Generic Domain Exceptions
  if (err instanceof DomainException && typeof err.status === "number") {
    res.status(err.status).json({
      success: false,
      message: err.message,
      requestId: traceId,
    });
    return;
  }

  // 6. Internal Server Error (HTTP 500)
  const isProd = process.env.NODE_ENV === "production";
  res.status(500).json({
    success: false,
    message: isProd
      ? "Đã xảy ra lỗi trong quá trình xử lý chứng từ."
      : message || "Đã xảy ra lỗi trong quá trình xử lý chứng từ.",
    requestId: traceId,
  });
}
