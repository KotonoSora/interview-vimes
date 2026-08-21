// src/domain/repositories/master-data.repository.interface.ts
import { Organization } from "#/domain/entities/organization.entity";

export interface IMasterDataRepository {
  getActiveOrganizations(): Promise<Organization[]>;
  getActiveWarehouses?(): Promise<any[]>;
  getActiveProducts?(): Promise<any[]>;
}
