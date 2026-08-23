// src/application/use-cases/get-warehouses.use-case.ts
import {
  IMasterDataRepository,
  WarehouseSummary,
} from "#/domain/repositories/master-data.repository.interface";

export class GetWarehousesUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute(): Promise<WarehouseSummary[]> {
    const warehouses = await this.masterDataRepo.getActiveWarehouses();
    return warehouses.map((wh: any) =>
      typeof wh.toJSON === "function" ? wh.toJSON() : wh,
    );
  }
}
