// tests/unit/application/get-warehouses.use-case.test.ts
import { describe, expect, it, vi } from "vitest";

import { GetWarehousesUseCase } from "#/application/use-cases/get-warehouses.use-case";
import { Warehouse } from "#/domain/entities/warehouse.entity";
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";

describe("[Unit Test] GetWarehousesUseCase", () => {
  it("TC-UC-WH-01: Phải trả về danh sách các kho đang active", async () => {
    const mockRepo: IMasterDataRepository = {
      getActiveOrganizations: vi.fn(),
      getActiveWarehouses: vi.fn().mockResolvedValue([
        Warehouse.create({
          id: "wh-uuid-1",
          organizationId: "org-uuid-1",
          code: "KHO-TONG",
          name: "Kho Tổng Trung Tâm",
          location: "Hà Nội",
          isActive: true,
        }),
      ]),
      searchProducts: vi.fn(),
    };

    const useCase = new GetWarehousesUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "wh-uuid-1",
      organizationId: "org-uuid-1",
      code: "KHO-TONG",
      name: "Kho Tổng Trung Tâm",
      location: "Hà Nội",
      isActive: true,
    });
    expect(mockRepo.getActiveWarehouses).toHaveBeenCalledOnce();
  });
});
