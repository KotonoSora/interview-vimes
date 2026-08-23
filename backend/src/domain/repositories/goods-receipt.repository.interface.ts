// src/domain/repositories/goods-receipt.repository.interface.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";

export type GoodsReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface PaginationQuery {
  page: number;
  limit: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  status?: GoodsReceiptStatus;
}

export interface GoodsReceiptListItem {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  warehouseName: string;
  delivererName: string;
  totalAmount: number;
  status: GoodsReceiptStatus;
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
  findById(id: string): Promise<any | null>;
  findByReceiptNumber(receiptNumber: string): Promise<GoodsReceipt | null>;
  findPaginated(
    query: PaginationQuery,
  ): Promise<PaginatedResult<GoodsReceiptListItem>>;
  update(id: string, entity: GoodsReceipt): Promise<void>;
  updateWithTransaction(entity: GoodsReceipt): Promise<GoodsReceipt>;
  deleteById(id: string): Promise<void>;
  deleteOrCancel(
    id: string,
  ): Promise<{ action: "HARD_DELETED" | "CANCELLED_AND_REVERSED" }>;
}
