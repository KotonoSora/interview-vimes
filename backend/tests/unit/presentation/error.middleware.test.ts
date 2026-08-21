// tests/unit/presentation/error.middleware.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { errorMiddleware } from "#/presentation/middlewares/error.middleware";
import {
  DomainValidationError,
  EntityNotFoundError,
} from "#/domain/exceptions/domain.exception";

describe("[Presentation - Middleware] error.middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;
  let setHeaderMock: any;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    setHeaderMock = vi.fn();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { id: "req-trace-123", headers: {} } as unknown as Request;
    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    } as unknown as Response;
    next = vi.fn() as NextFunction;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("TC-ERR-01: Phải trả về 400 khi gặp ZodError", () => {
    const schema = z.object({ code: z.string().min(1, "Mã không được rỗng") });
    let zodErr!: ZodError;
    try {
      schema.parse({ code: "" });
    } catch (e) {
      zodErr = e as ZodError;
    }

    errorMiddleware(zodErr, req, res, next);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Validation Error"),
      }),
    );
  });

  it("TC-ERR-02: Phải trả về 404 khi gặp EntityNotFoundError hoặc message chứa 'Không tìm thấy'", () => {
    const err = new EntityNotFoundError("Phiếu nhập kho", "uuid-123");
    errorMiddleware(err, req, res, next);
    expect(statusMock).toHaveBeenCalledWith(404);
  });

  it("TC-ERR-03: Phải trả về 409 khi message chứa 'đã tồn tại'", () => {
    const err = new Error("Số phiếu PNK-001 đã tồn tại trong hệ thống");
    errorMiddleware(err, req, res, next);
    expect(statusMock).toHaveBeenCalledWith(409);
  });

  it("TC-ERR-04: Phải trả về 422 khi gặp DomainValidationError hoặc message chứa CANCELLED", () => {
    const err = new DomainValidationError("Không thể sửa phiếu đã CANCELLED");
    errorMiddleware(err, req, res, next);
    expect(statusMock).toHaveBeenCalledWith(422);
  });

  it("TC-ERR-05: Khi ở môi trường production, lỗi 500 phải ẩn chi tiết", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("Lỗi kết nối DB bí mật");
    errorMiddleware(err, req, res, next);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Đã xảy ra lỗi trong quá trình xử lý chứng từ.",
      }),
    );
  });

  it("TC-ERR-06: Phải lấy requestId từ header x-request-id nếu req.id không tồn tại", () => {
    req = {
      headers: { "x-request-id": "header-trace-456" },
    } as unknown as Request;
    const err = new Error("Lỗi test header");
    errorMiddleware(err, req, res, next);
    expect(setHeaderMock).toHaveBeenCalledWith(
      "X-Request-Id",
      "header-trace-456",
    );
  });
});
