// src/presentation/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (
    err instanceof ZodError ||
    err?.name === "ZodError" ||
    Array.isArray(err?.issues)
  ) {
    res.status(400).json({
      success: false,
      message: "Lỗi xác thực dữ liệu đầu vào (Validation Error)",
      requestId: req.id,
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

  const message = err?.message || "Lỗi xử lý nội bộ hệ thống";
  if (message.includes("Không tìm thấy") || err?.status === 404) {
    res.status(404).json({
      success: false,
      message,
      requestId: req.id,
    });
    return;
  }

  if (err?.name === "DomainValidationError" || err?.status === 422) {
    res.status(422).json({
      success: false,
      message,
      requestId: req.id,
    });
    return;
  }

  const statusCode = typeof err?.status === "number" ? err.status : 500;
  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.id,
  });
}
