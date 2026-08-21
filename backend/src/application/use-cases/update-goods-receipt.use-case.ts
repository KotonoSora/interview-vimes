// src/application/use-cases/update-goods-receipt.use-case.ts
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { UpdateGoodsReceiptDTO } from "#/application/dtos/update-goods-receipt.dto";

export interface UpdateGoodsReceiptResult {
  receiptId: string;
  totalAmount: number;
}

export class UpdateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService?: any,
  ) {}

  async execute(
    id: string,
    dto: UpdateGoodsReceiptDTO,
    requestId?: string,
  ): Promise<UpdateGoodsReceiptResult> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new Error("Không tìm thấy phiếu nhập kho với ID đã cung cấp.");
    }

    if (existing.status === "CANCELLED") {
      throw new Error(
        "Không thể chỉnh sửa phiếu nhập đã ở trạng thái CANCELLED.",
      );
    }

    let updatedItems: ReceiptItem[] = existing.items;
    if (dto.items && dto.items.length > 0) {
      updatedItems = dto.items.map(
        (item, idx) =>
          new ReceiptItem({
            id: item.productId,
            lineNo: item.lineNo ?? idx + 1,
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            unitSnapshot: item.unitSnapshot,
            docQty: new Quantity(item.docQty),
            actualQty: new Quantity(item.actualQty),
            unitPrice: new Money(item.unitPrice),
            debitAccount: item.debitAccount ?? undefined,
            creditAccount: item.creditAccount ?? undefined,
            note: item.note ?? undefined,
          }),
      );
    }

    const updatedEntity = new GoodsReceipt({
      id: existing.id,
      receiptNumber: existing.receiptNumber,
      organizationId: existing.organizationId,
      warehouseId: existing.warehouseId,
      receiptDate: dto.receiptDate
        ? new Date(dto.receiptDate)
        : existing.receiptDate,
      actualReceivedDate: dto.actualReceivedDate
        ? new Date(dto.actualReceivedDate)
        : existing.actualReceivedDate,
      receiptType: dto.receiptType ?? existing.receiptType,
      delivererName: dto.delivererName ?? existing.delivererName,
      docReference:
        dto.docReference !== undefined
          ? (dto.docReference ?? undefined)
          : existing.docReference,
      docDate: dto.docDate ? new Date(dto.docDate) : existing.docDate,
      docOrigin:
        dto.docOrigin !== undefined
          ? (dto.docOrigin ?? undefined)
          : existing.docOrigin,
      debitAccount:
        dto.debitAccount !== undefined
          ? (dto.debitAccount ?? undefined)
          : existing.debitAccount,
      creditAccount:
        dto.creditAccount !== undefined
          ? (dto.creditAccount ?? undefined)
          : existing.creditAccount,
      description:
        dto.description !== undefined
          ? (dto.description ?? undefined)
          : existing.description,
      attachedDocCount:
        dto.attachedDocCount !== undefined
          ? (dto.attachedDocCount ?? undefined)
          : existing.attachedDocCount,
      creatorName:
        dto.creatorName !== undefined
          ? (dto.creatorName ?? undefined)
          : existing.creatorName,
      storekeeperName:
        dto.storekeeperName !== undefined
          ? (dto.storekeeperName ?? undefined)
          : existing.storekeeperName,
      chiefAccountantName:
        dto.chiefAccountantName !== undefined
          ? (dto.chiefAccountantName ?? undefined)
          : existing.chiefAccountantName,
      status: existing.status,
      items: updatedItems,
    });

    await this.receiptRepo.updateWithTransaction(updatedEntity);

    const totalAmount = updatedEntity.calculateTotalAmount().value;

    if (this.auditService && typeof this.auditService.logEvent === "function") {
      await this.auditService.logEvent({
        eventName: "GOODS_RECEIPT_UPDATED",
        requestId,
        receiptId: id,
        totalAmount,
      });
    }

    return {
      receiptId: id,
      totalAmount,
    };
  }
}
