// src/application/use-cases/get-products.use-case.ts
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";

export class GetProductsUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute(searchQuery?: string) {
    const products = await this.masterDataRepo.searchProducts(searchQuery);
    return products.map((p) => p.toJSON());
  }
}
