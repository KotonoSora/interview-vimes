// tests/unit/presentation/master-data.controller.test.ts
import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MasterDataController } from "#/presentation/controllers/master-data.controller";

describe("[Presentation - Controller] MasterDataController", () => {
  let mockGetOrgsUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockGetWarehousesUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockGetProductsUseCase: { execute: ReturnType<typeof vi.fn> };
  let controller: MasterDataController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetOrgsUseCase = { execute: vi.fn() };
    mockGetWarehousesUseCase = { execute: vi.fn() };
    mockGetProductsUseCase = { execute: vi.fn() };

    controller = new MasterDataController(
      mockGetOrgsUseCase as any,
      mockGetWarehousesUseCase as any,
      mockGetProductsUseCase as any,
    );

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };
    next = vi.fn();
    req = { id: "test-request-id", query: {} };
  });

  describe("getOrganizations", () => {
    it("TC-MD-CTRL-01: Phải trả về danh sách organizations thành công kèm requestId", async () => {
      const mockData = [{ id: "org-1", name: "Công ty VIMES" }];
      mockGetOrgsUseCase.execute.mockResolvedValueOnce(mockData);

      await controller.getOrganizations(req as Request, res as Response, next);

      expect(mockGetOrgsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        requestId: "test-request-id",
        data: mockData,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("TC-MD-CTRL-02: Phải gọi next(error) khi getOrganizationsUseCase gặp lỗi (line 27)", async () => {
      const error = new Error("Database query failed");
      mockGetOrgsUseCase.execute.mockRejectedValueOnce(error);

      await controller.getOrganizations(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("getWarehouses", () => {
    it("TC-MD-CTRL-03: Phải trả về danh sách warehouses thành công kèm requestId", async () => {
      const mockData = [{ id: "wh-1", name: "Kho Tổng Hà Nội" }];
      mockGetWarehousesUseCase.execute.mockResolvedValueOnce(mockData);

      await controller.getWarehouses(req as Request, res as Response, next);

      expect(mockGetWarehousesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        requestId: "test-request-id",
        data: mockData,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("TC-MD-CTRL-04: Phải gọi next(error) khi getWarehousesUseCase gặp lỗi (line 44)", async () => {
      const error = new Error("Warehouse service unavailable");
      mockGetWarehousesUseCase.execute.mockRejectedValueOnce(error);

      await controller.getWarehouses(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe("getProducts", () => {
    it("TC-MD-CTRL-05: Phải truyền searchQuery khi query.search là string và trả về data", async () => {
      req.query = { search: "Thép" };
      const mockData = [{ id: "prod-1", name: "Thép cuộn Phi 6" }];
      mockGetProductsUseCase.execute.mockResolvedValueOnce(mockData);

      await controller.getProducts(req as Request, res as Response, next);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith("Thép");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        requestId: "test-request-id",
        data: mockData,
      });
    });

    it("TC-MD-CTRL-06: Phải truyền undefined khi query.search không phải string (line 54 branch)", async () => {
      req.query = { search: ["invalid-array-param"] as any };
      const mockData = [{ id: "prod-1", name: "Toàn bộ vật tư" }];
      mockGetProductsUseCase.execute.mockResolvedValueOnce(mockData);

      await controller.getProducts(req as Request, res as Response, next);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith(undefined);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("TC-MD-CTRL-07: Phải gọi next(error) khi getProductsUseCase gặp lỗi (line 63)", async () => {
      const error = new Error("Product catalog error");
      mockGetProductsUseCase.execute.mockRejectedValueOnce(error);

      await controller.getProducts(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
