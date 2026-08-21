// tests/unit/application/get-organizations.use-case.test.ts
import { describe, it, expect, vi } from "vitest";
import { GetOrganizationsUseCase } from "#/application/use-cases/get-organizations.use-case";
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";
import { Organization } from "#/domain/entities/organization.entity";

describe("GetOrganizationsUseCase", () => {
  it("TC-UC-ORG-01: Phải lấy danh sách đơn vị/tổ chức hoạt động thành công", async () => {
    const mockRepo: IMasterDataRepository = {
      getActiveOrganizations: vi.fn().mockResolvedValue([
        Organization.create({
          id: "org-uuid-1",
          code: "ORG001",
          name: "Công ty Cổ phần VIMES",
          department: "Kho Vận & Vật Tư Y Tế",
        }),
      ]),
      getActiveWarehouses: vi.fn(),
      searchProducts: vi.fn(),
    };

    const useCase = new GetOrganizationsUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual([
      {
        id: "org-uuid-1",
        code: "ORG001",
        name: "Công ty Cổ phần VIMES",
        department: "Kho Vận & Vật Tư Y Tế",
      },
    ]);
    expect(mockRepo.getActiveOrganizations).toHaveBeenCalledOnce();
  });
});
