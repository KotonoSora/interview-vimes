// src/domain/repositories/master-data.repository.interface.ts
import { Organization } from "#/domain/entities/organization.entity";
import { Product } from "#/domain/entities/product.entity";
import { Warehouse } from "#/domain/entities/warehouse.entity";

export interface IMasterDataRepository {
  getActiveOrganizations(): Promise<Organization[]>;
  getActiveWarehouses(): Promise<Warehouse[]>;
  searchProducts(searchQuery?: string): Promise<Product[]>;
}
