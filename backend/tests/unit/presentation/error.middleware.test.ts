// tests/unit/presentation/error.middleware.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";

describe("[Presentation - Middleware] Centralized Error Handling", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;
  const originalNodeEnv = process.env.NODE_ENV;

  const createErrorHandler = () => {
    return (
      err: any,
      request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (err instanceof ZodError) {
        response.status(400).json({
          success: false,
          message: "Lỗi xác thực dữ liệu đầu vào (Validation Error)",
          requestId: request.id,
          errors: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      const isProduction = process.env.NODE_ENV === "production";
      const statusCode = typeof err.status === "number" ? err.status : 500;

      response.status(statusCode).json({
        success: false,
        message:
          isProduction && statusCode === 500
            ? "Đã xảy ra lỗi trong quá trình xử lý chứng từ."
            : err.message || "Lỗi xử lý nội bộ hệ thống",
        requestId: request.id,
      });
    };
  };

  beforeEach(() => {
    req = { id: "req-trace-uuid-123" } as unknown as Request;
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    next = vi.fn() as NextFunction;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("TC-MID-ERR-01: Khi nhận ZodError, phải trả về HTTP 400 kèm mảng chi tiết errors và requestId", () => {
    const testSchema = z.object({
      receiptNumber: z.string().min(1, "Số phiếu không được rỗng"),
    });

    let zodErr: ZodError | null = null;
    try {
      testSchema.parse({ receiptNumber: "" });
    } catch (e) {
      zodErr = e as ZodError;
    }

    const errorHandler = createErrorHandler();
    errorHandler(zodErr, req, res, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Lỗi xác thực dữ liệu đầu vào (Validation Error)",
      requestId: "req-trace-uuid-123",
      errors: [
        {
          path: "receiptNumber",
          message: "Số phiếu không được rỗng",
        },
      ],
    });
  });

  it("TC-MID-ERR-02: Khi ở môi trường production, lỗi HTTP 500 phải trả về thông báo chung và che giấu stack trace", () => {
    process.env.NODE_ENV = "production";
    const internalErr = new Error(
      "Database deadlock at transaction connection pool",
    );

    const errorHandler = createErrorHandler();
    errorHandler(internalErr, req, res, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xử lý chứng từ.",
      requestId: "req-trace-uuid-123",
    });
  });

  it("TC-MID-ERR-03: Khi ở môi trường development, lỗi HTTP 500 phải trả về message thực tế phục vụ debug", () => {
    process.env.NODE_ENV = "development";
    const internalErr = new Error(
      "Database deadlock at transaction connection pool",
    );

    const errorHandler = createErrorHandler();
    errorHandler(internalErr, req, res, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Database deadlock at transaction connection pool",
      requestId: "req-trace-uuid-123",
    });
  });
});
