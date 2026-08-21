// tests/unit/presentation/request-id.middleware.test.ts
import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requestIdMiddleware } from "#/presentation/middlewares/request-id.middleware";

describe("[Presentation - Middleware] RequestIdMiddleware", () => {
  it("TC-MID-REQID-01: Phải tự động sinh UUID mới và gắn vào req.id cùng Header X-Request-Id nếu client không gửi", () => {
    const req = {
      headers: {},
    } as unknown as Request;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe("string");
    expect(req.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(setHeaderMock).toHaveBeenCalledWith("X-Request-Id", req.id);
    expect(next).toHaveBeenCalledOnce();
  });

  it("TC-MID-REQID-02: Phải giữ nguyên và sử dụng X-Request-Id do client gửi lên trong header", () => {
    const existingRequestId = "custom-client-trace-uuid-12345";
    const req = {
      headers: {
        "x-request-id": existingRequestId,
      },
    } as unknown as Request;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.id).toBe(existingRequestId);
    expect(setHeaderMock).toHaveBeenCalledWith(
      "X-Request-Id",
      existingRequestId,
    );
    expect(next).toHaveBeenCalledOnce();
  });
});
