// src/application/use-cases/get-warehouses.use-case.ts
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";

export class GetWarehousesUseCase {
  constructor(private readonly masterDataRepo: IMasterDataRepository) {}

  async execute() {
    const warehouses = await this.masterDataRepo.getActiveWarehouses();
    return warehouses.map((wh) => wh.toJSON());
  }
}
