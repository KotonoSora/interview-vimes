// src/domain/repositories/goods-receipt.repository.interface.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";

export interface IGoodsReceiptRepository {
  findById(id: string): Promise<GoodsReceipt | null>;
  findByReceiptNumber(receiptNumber: string): Promise<GoodsReceipt | null>;
  saveWithTransaction(
    receipt: GoodsReceipt,
    totalAmountWords?: string,
  ): Promise<string>;
  updateWithTransaction(
    receipt: GoodsReceipt,
    totalAmountWords?: string,
  ): Promise<void>;
  deleteById(id: string): Promise<void>;
}
