// src/application/use-cases/get-organizations.use-case.ts
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";

export class GetOrganizationsUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute() {
    const organizations = await this.masterDataRepo.getActiveOrganizations();
    return organizations.map((org) => org.toJSON());
  }
}
