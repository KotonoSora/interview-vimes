// src/presentation/middlewares/error.middleware.ts
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message =
    err?.message || "Đã xảy ra lỗi trong quá trình xử lý chứng từ.";
  const traceId = req.id || (req.headers["x-request-id"] as string) || "";

  if (traceId) {
    res.setHeader("X-Request-Id", traceId);
  }

  // 1. Zod Validation (HTTP 400)
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

  // 2. Conflict / Duplicate (HTTP 409)
  if (message.includes("đã tồn tại")) {
    res.status(409).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 3. Not Found (HTTP 404)
  if (message.includes("Không tìm thấy") || err?.status === 404) {
    res.status(404).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 4. Unprocessable Content (HTTP 422)
  if (
    message.includes("CANCELLED") ||
    message.includes("đã bị hủy") ||
    err?.status === 422
  ) {
    res.status(422).json({
      success: false,
      message,
      requestId: traceId,
    });
    return;
  }

  // 5. Internal Server Error (HTTP 500)
  const statusCode = typeof err?.status === "number" ? err.status : 500;
  res.status(statusCode).json({
    success: false,
    message: "Đã xảy ra lỗi trong quá trình xử lý chứng từ.",
    requestId: traceId,
  });
}
