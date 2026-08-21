// tests/unit/application/get-products.use-case.test.ts
import { describe, it, expect, vi } from "vitest";
import { GetProductsUseCase } from "#/application/use-cases/get-products.use-case";
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";
import { Product } from "#/domain/entities/product.entity";

describe("[Unit Test] GetProductsUseCase", () => {
  it("TC-UC-PROD-01: Phải tìm kiếm danh mục sản phẩm theo từ khóa", async () => {
    const mockRepo: IMasterDataRepository = {
      getActiveOrganizations: vi.fn(),
      getActiveWarehouses: vi.fn(),
      searchProducts: vi.fn().mockResolvedValue([
        Product.create({
          id: "prod-uuid-1",
          code: "VT-001",
          name: "Thép cuộn Phi 6",
          unit: "Kg",
          defaultPrice: 15000,
          isActive: true,
        }),
      ]),
    };

    const useCase = new GetProductsUseCase(mockRepo);
    const result = await useCase.execute("Thép");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Thép cuộn Phi 6");
    expect(mockRepo.searchProducts).toHaveBeenCalledWith("Thép");
  });
});
