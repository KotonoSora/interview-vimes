// src/application/use-cases/update-goods-receipt.use-case.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { UpdateGoodsReceiptDTO } from "#/application/dtos/update-goods-receipt.dto";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";

export class UpdateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService: AuditTrailService,
  ) {}

  public async execute(
    id: string,
    dto: UpdateGoodsReceiptDTO,
    requestId?: string,
  ): Promise<{ receiptId: string; totalAmount: number }> {
    const existingReceipt = await this.receiptRepo.findById(id);
    if (!existingReceipt) {
      throw new Error("Không tìm thấy phiếu nhập kho với ID đã cung cấp.");
    }

    if (existingReceipt.status === "CANCELLED") {
      throw new Error(
        "Không thể chỉnh sửa phiếu nhập đã ở trạng thái CANCELLED.",
      );
    }

    const items = dto.items.map(
      (item, index) =>
        new ReceiptItem({
          productId: item.productId,
          lineNo: index + 1,
          productNameSnapshot: item.productNameSnapshot,
          unitSnapshot: item.unitSnapshot,
          docQty: new Quantity(item.docQty),
          actualQty: new Quantity(item.actualQty),
          unitPrice: new Money(item.unitPrice),
          debitAccount: item.debitAccount,
          creditAccount: item.creditAccount,
          note: item.note,
        }),
    );

    const updatedReceipt = new GoodsReceipt({
      id: existingReceipt.id,
      receiptNumber: existingReceipt.receiptNumber,
      receiptDate: dto.receiptDate
        ? new Date(dto.receiptDate)
        : existingReceipt.receiptDate,
      actualReceivedDate: dto.actualReceivedDate
        ? new Date(dto.actualReceivedDate)
        : existingReceipt.actualReceivedDate,
      organizationId: dto.organizationId,
      warehouseId: dto.warehouseId,
      receiptType: dto.receiptType || existingReceipt.receiptType,
      description: dto.description ?? existingReceipt.description,
      delivererName: dto.delivererName,
      docReference: dto.docReference ?? existingReceipt.docReference,
      docDate: dto.docDate ? new Date(dto.docDate) : existingReceipt.docDate,
      docOrigin: dto.docOrigin ?? existingReceipt.docOrigin,
      debitAccount: dto.debitAccount ?? existingReceipt.debitAccount,
      creditAccount: dto.creditAccount ?? existingReceipt.creditAccount,
      attachedDocCount:
        dto.attachedDocCount ?? existingReceipt.attachedDocCount,
      creatorName: dto.creatorName ?? existingReceipt.creatorName,
      storekeeperName: dto.storekeeperName ?? existingReceipt.storekeeperName,
      chiefAccountantName:
        dto.chiefAccountantName ?? existingReceipt.chiefAccountantName,
      status: dto.status || existingReceipt.status,
      items,
    });

    await this.receiptRepo.updateWithTransaction(
      updatedReceipt,
      dto.totalAmountWords,
    );

    this.auditService.logEvent({
      eventName: "GOODS_RECEIPT_UPDATED",
      requestId: requestId || "unknown",
      receiptId: id,
      receiptNumber: updatedReceipt.receiptNumber,
      warehouseId: updatedReceipt.warehouseId,
      totalAmount: updatedReceipt.calculateTotalAmount().value,
      itemCount: updatedReceipt.items.length,
      timestamp: new Date(),
    });

    return {
      receiptId: id,
      totalAmount: updatedReceipt.calculateTotalAmount().value,
    };
  }
}
