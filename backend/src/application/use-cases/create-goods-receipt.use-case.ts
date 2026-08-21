// src/application/use-cases/create-goods-receipt.use-case.ts
import { CreateGoodsReceiptDTO } from "#/application/dtos/create-goods-receipt.dto";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { DomainValidationError } from "#/domain/exceptions/domain.exception";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

export interface CreateGoodsReceiptResult {
  id: string;
  receiptId: string;
  receiptNumber: string;
  totalAmount: number;
}

export class CreateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService?: any,
  ) {}

  async execute(
    dto: CreateGoodsReceiptDTO,
    requestId?: string,
  ): Promise<CreateGoodsReceiptResult> {
    const existing = await this.receiptRepo.findByReceiptNumber(
      dto.receiptNumber,
    );
    if (existing) {
      throw new DomainValidationError(
        `Số phiếu ${dto.receiptNumber} đã tồn tại trên hệ thống.`,
      );
    }

    const domainItems = dto.items.map((item, index) => {
      return new ReceiptItem({
        lineNo: item.lineNo ?? index + 1,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        unitSnapshot: item.unitSnapshot,
        docQty: new Quantity(item.docQty),
        actualQty: new Quantity(item.actualQty),
        unitPrice: new Money(item.unitPrice),
        debitAccount: item.debitAccount ?? undefined,
        creditAccount: item.creditAccount ?? undefined,
        note: item.note ?? undefined,
      });
    });

    const aggregate = GoodsReceipt.create({
      receiptNumber: dto.receiptNumber,
      organizationId: dto.organizationId,
      warehouseId: dto.warehouseId,
      receiptDate: new Date(dto.receiptDate),
      actualReceivedDate: dto.actualReceivedDate
        ? new Date(dto.actualReceivedDate)
        : undefined,
      receiptType: dto.receiptType,
      delivererName: dto.delivererName,
      docReference: dto.docReference ?? undefined,
      docDate: dto.docDate ? new Date(dto.docDate) : undefined,
      docOrigin: dto.docOrigin ?? undefined,
      debitAccount: dto.debitAccount ?? undefined,
      creditAccount: dto.creditAccount ?? undefined,
      description: dto.description ?? undefined,
      attachedDocCount: dto.attachedDocCount ?? undefined,
      creatorName: dto.creatorName ?? undefined,
      storekeeperName: dto.storekeeperName ?? undefined,
      chiefAccountantName: dto.chiefAccountantName ?? undefined,
      status: dto.status ?? "CONFIRMED",
      items: domainItems,
    });

    const totalAmount = aggregate.calculateTotalAmount().value;

    const saveResult = await this.receiptRepo.saveWithTransaction(aggregate);
    const receiptId =
      typeof saveResult === "string"
        ? saveResult
        : (saveResult as any)?.id || "generated-uuid-receipt-id";

    if (this.auditService && typeof this.auditService.logEvent === "function") {
      await this.auditService.logEvent({
        eventName: "GOODS_RECEIPT_CREATED",
        requestId,
        receiptId,
        totalAmount,
      });
    }

    return {
      id: receiptId,
      receiptId,
      receiptNumber: dto.receiptNumber,
      totalAmount,
    };
  }
}
