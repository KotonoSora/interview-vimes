// src/application/use-cases/get-organizations.use-case.ts
import {
  IMasterDataRepository,
  OrganizationSummary,
} from "#/domain/repositories/master-data.repository.interface";

export class GetOrganizationsUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute(): Promise<OrganizationSummary[]> {
    const organizations = await this.masterDataRepo.getActiveOrganizations();
    return organizations.map((org: any) =>
      typeof org.toJSON === "function" ? org.toJSON() : org,
    );
  }
}
