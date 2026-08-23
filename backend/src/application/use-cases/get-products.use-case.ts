// src/application/use-cases/get-products.use-case.ts
import {
  IMasterDataRepository,
  ProductSummary,
} from "#/domain/repositories/master-data.repository.interface";

export class GetProductsUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute(searchQuery?: string): Promise<ProductSummary[]> {
    const sanitizedSearch = searchQuery?.trim() || undefined;
    return this.masterDataRepo.searchProducts(sanitizedSearch);
  }
}
