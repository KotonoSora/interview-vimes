// src/application/use-cases/create-goods-receipt.use-case.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { CreateGoodsReceiptDTO } from "#/application/dtos/create-goods-receipt.dto";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";

export class CreateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService: AuditTrailService,
  ) {}

  public async execute(
    dto: CreateGoodsReceiptDTO,
    requestId?: string,
  ): Promise<{ receiptId: string; totalAmount: number }> {
    const existingReceipt = await this.receiptRepo.findByReceiptNumber(
      dto.receiptNumber,
    );
    if (existingReceipt) {
      throw new Error(
        `Số phiếu ${dto.receiptNumber} đã tồn tại trên hệ thống.`,
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

    const receipt = new GoodsReceipt({
      receiptNumber: dto.receiptNumber,
      receiptDate: new Date(dto.receiptDate),
      actualReceivedDate: dto.actualReceivedDate
        ? new Date(dto.actualReceivedDate)
        : undefined,
      organizationId: dto.organizationId,
      warehouseId: dto.warehouseId,
      receiptType: dto.receiptType,
      description: dto.description,
      delivererName: dto.delivererName,
      docReference: dto.docReference,
      docDate: dto.docDate ? new Date(dto.docDate) : undefined,
      docOrigin: dto.docOrigin,
      debitAccount: dto.debitAccount,
      creditAccount: dto.creditAccount,
      attachedDocCount: dto.attachedDocCount,
      creatorName: dto.creatorName,
      storekeeperName: dto.storekeeperName,
      chiefAccountantName: dto.chiefAccountantName,
      status: dto.status || "CONFIRMED",
      items,
    });

    const receiptId = await this.receiptRepo.saveWithTransaction(
      receipt,
      dto.totalAmountWords,
    );

    this.auditService.logEvent({
      eventName: "GOODS_RECEIPT_CREATED",
      requestId: requestId || "unknown",
      receiptId,
      receiptNumber: receipt.receiptNumber,
      warehouseId: receipt.warehouseId,
      totalAmount: receipt.calculateTotalAmount().value,
      itemCount: receipt.items.length,
      timestamp: new Date(),
    });

    return {
      receiptId,
      totalAmount: receipt.calculateTotalAmount().value,
    };
  }
}
