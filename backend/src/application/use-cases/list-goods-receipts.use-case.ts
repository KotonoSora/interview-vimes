// src/application/use-cases/list-goods-receipts.use-case.ts
import {
  GoodsReceiptListItem,
  GoodsReceiptStatus,
  IGoodsReceiptRepository,
  PaginatedResult,
  PaginationQuery,
} from "#/domain/repositories/goods-receipt.repository.interface";

export interface ListGoodsReceiptsInput {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  status?: string;
}

export class ListGoodsReceiptsUseCase {
  constructor(private readonly goodsReceiptRepo: IGoodsReceiptRepository) {}

  public async execute(
    input: ListGoodsReceiptsInput = {},
  ): Promise<PaginatedResult<GoodsReceiptListItem>> {
    const sanitizedPage = Math.max(1, Number(input.page) || 1);
    const sanitizedLimit = Math.min(
      100,
      Math.max(1, Number(input.limit) || 20),
    );

    let sanitizedStatus: GoodsReceiptStatus | undefined;
    if (
      input.status === "DRAFT" ||
      input.status === "CONFIRMED" ||
      input.status === "CANCELLED"
    ) {
      sanitizedStatus = input.status;
    }

    const query: PaginationQuery = {
      page: sanitizedPage,
      limit: sanitizedLimit,
      search: input.search?.trim() || undefined,
      fromDate: input.fromDate?.trim() || undefined,
      toDate: input.toDate?.trim() || undefined,
      warehouseId: input.warehouseId?.trim() || undefined,
      status: sanitizedStatus,
    };

    return this.goodsReceiptRepo.findPaginated(query);
  }
}
