// src/application/use-cases/delete-goods-receipt.use-case.ts
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";

export class DeleteGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService: AuditTrailService,
  ) {}

  public async execute(
    id: string,
    requestId?: string,
  ): Promise<{
    receiptId: string;
    action: "HARD_DELETED" | "CANCELLED_AND_REVERSED";
  }> {
    const existingReceipt = await this.receiptRepo.findById(id);
    if (!existingReceipt) {
      throw new Error("Không tìm thấy phiếu nhập kho với ID đã cung cấp.");
    }

    if (existingReceipt.status === "CANCELLED") {
      throw new Error("Phiếu này đã ở trạng thái hủy trước đó.");
    }

    if (existingReceipt.status === "DRAFT") {
      await this.receiptRepo.deleteById(id);

      this.auditService.logEvent({
        eventName: "GOODS_RECEIPT_HARD_DELETED",
        requestId: requestId || "unknown",
        receiptId: id,
        receiptNumber: existingReceipt.receiptNumber,
        timestamp: new Date(),
      });

      return {
        receiptId: id,
        action: "HARD_DELETED",
      };
    }

    // Nếu status === 'CONFIRMED' -> Thực hiện Hủy chứng từ & Hoàn kho (Stock Reversal)
    existingReceipt.cancel();
    await this.receiptRepo.updateWithTransaction(existingReceipt);

    this.auditService.logEvent({
      eventName: "GOODS_RECEIPT_CANCELLED_AND_REVERSED",
      requestId: requestId || "unknown",
      receiptId: id,
      receiptNumber: existingReceipt.receiptNumber,
      timestamp: new Date(),
    });

    return {
      receiptId: id,
      action: "CANCELLED_AND_REVERSED",
    };
  }
}
