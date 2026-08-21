// tests/unit/presentation/goods-receipt.controller.test.ts
import { describe, expect, it, vi } from "vitest";

import { GoodsReceiptController } from "#/presentation/controllers/goods-receipt.controller";

describe("[Presentation] GoodsReceiptController Error Handling & Branch Coverage", () => {
  const createMockUseCase = (shouldThrow = true, resultValue: any = {}) => ({
    execute: shouldThrow
      ? vi.fn().mockRejectedValue(new Error("UseCase execution failed"))
      : vi.fn().mockResolvedValue(resultValue),
  });

  const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it("TC-CTRL-01: getList() phải gọi next(err) khi listUseCase ném ngoại lệ", async () => {
    const controller = new GoodsReceiptController(
      createMockUseCase(false) as any, // create
      createMockUseCase(false) as any, // update
      createMockUseCase(false) as any, // delete
      createMockUseCase(true) as any, // list (throws)
      createMockUseCase(false) as any, // detail
    );

    const req: any = { query: { page: "1", limit: "10" }, id: "req-123" };
    const res = mockResponse();
    const next = vi.fn();

    await controller.getList(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("TC-CTRL-02: getDetail() phải gọi next(err) khi detailUseCase ném ngoại lệ", async () => {
    const controller = new GoodsReceiptController(
      createMockUseCase(false) as any, // create
      createMockUseCase(false) as any, // update
      createMockUseCase(false) as any, // delete
      createMockUseCase(false) as any, // list
      createMockUseCase(true) as any, // detail (throws)
    );

    const req: any = { params: { id: "non-existent-id" }, id: "req-123" };
    const res = mockResponse();
    const next = vi.fn();

    await controller.getDetail(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("TC-CTRL-03: create() phải gọi next(err) khi dữ liệu body không hợp lệ", async () => {
    const controller = new GoodsReceiptController(
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
    );

    const req: any = { body: {}, id: "req-123" }; // body rỗng kích hoạt ZodError
    const res = mockResponse();
    const next = vi.fn();

    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("TC-CTRL-04: update() phải gọi next(err) khi updateUseCase ném ngoại lệ", async () => {
    const controller = new GoodsReceiptController(
      createMockUseCase(false) as any,
      createMockUseCase(true) as any, // update (throws)
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
    );

    const req: any = {
      params: { id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" },
      body: {
        delivererName: "Nguyễn Văn A",
      },
      id: "req-123",
    };
    const res = mockResponse();
    const next = vi.fn();

    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("TC-CTRL-05: delete() phải gọi next(err) khi deleteUseCase ném ngoại lệ", async () => {
    const controller = new GoodsReceiptController(
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
      createMockUseCase(true) as any, // delete (throws)
      createMockUseCase(false) as any,
      createMockUseCase(false) as any,
    );

    const req: any = {
      params: { id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" },
      id: "req-123",
    };
    const res = mockResponse();
    const next = vi.fn();

    await controller.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
