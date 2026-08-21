// src/domain/repositories/goods-receipt.repository.interface.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  data: T[];
}

export interface IGoodsReceiptRepository {
  save(entity: GoodsReceipt): Promise<{ id: string; receiptNumber: string }>;
  saveWithTransaction(entity: GoodsReceipt): Promise<GoodsReceipt>;
  findById(id: string): Promise<GoodsReceipt | any | null>;
  findByReceiptNumber(receiptNumber: string): Promise<GoodsReceipt | null>;
  findPaginated(pagination: PaginationQuery): Promise<PaginatedResult<any>>;
  update(id: string, entity: GoodsReceipt): Promise<void>;
  updateWithTransaction(entity: GoodsReceipt): Promise<GoodsReceipt>;
  deleteById(id: string): Promise<void>;
  deleteOrCancel(
    id: string,
  ): Promise<{ action: "HARD_DELETED" | "CANCELLED_REVERSED" }>;
}
