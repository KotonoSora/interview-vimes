// src/domain/repositories/master-data.repository.interface.ts
import { Organization } from "#/domain/entities/organization.entity";
import { Product } from "#/domain/entities/product.entity";
import { Warehouse } from "#/domain/entities/warehouse.entity";

export interface ProductSummary {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
}

export interface WarehouseSummary {
  id: string;
  code: string;
  name: string;
  location?: string | null;
}

export interface OrganizationSummary {
  id: string;
  code: string;
  name: string;
  department?: string | null;
}

export interface IMasterDataRepository {
  getActiveOrganizations(): Promise<OrganizationSummary[]>;
  getActiveWarehouses(): Promise<WarehouseSummary[]>;
  searchProducts(searchQuery?: string): Promise<ProductSummary[]>;
}
