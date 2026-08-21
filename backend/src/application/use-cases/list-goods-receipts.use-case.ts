// src/application/use-cases/list-goods-receipts.use-case.ts
import {
  IGoodsReceiptRepository,
  PaginatedResult,
} from "#/domain/repositories/goods-receipt.repository.interface";

export class ListGoodsReceiptsUseCase {
  constructor(private readonly goodsReceiptRepo: IGoodsReceiptRepository) {}

  public async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    return this.goodsReceiptRepo.findPaginated({
      page: sanitizedPage,
      limit: sanitizedLimit,
    });
  }
}
