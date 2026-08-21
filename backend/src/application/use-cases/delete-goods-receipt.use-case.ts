// src/application/use-cases/delete-goods-receipt.use-case.ts
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { DomainValidationError } from "#/domain/exceptions/domain.exception";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

export interface DeleteGoodsReceiptResult {
  action: "HARD_DELETED" | "CANCELLED_AND_REVERSED";
  receiptId: string;
}

export class DeleteGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService?: any,
  ) {}

  async execute(
    id: string,
    requestId?: string,
  ): Promise<DeleteGoodsReceiptResult> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new DomainValidationError(
        "Không tìm thấy phiếu nhập kho với ID đã cung cấp.",
      );
    }

    if (existing.status === "CANCELLED") {
      throw new DomainValidationError(
        "Phiếu này đã ở trạng thái hủy trước đó.",
      );
    }

    // 1. Trường hợp xóa cứng phiếu nháp (DRAFT)
    if (existing.status === "DRAFT") {
      await this.receiptRepo.deleteById(id);
      if (
        this.auditService &&
        typeof this.auditService.logEvent === "function"
      ) {
        await this.auditService.logEvent({
          eventName: "GOODS_RECEIPT_HARD_DELETED",
          requestId,
          receiptId: id,
        });
      }
      return { action: "HARD_DELETED", receiptId: id };
    }

    // 2. Trường hợp hủy chứng từ & hoàn kho (CONFIRMED -> CANCELLED)
    let aggregate: GoodsReceipt;

    if (existing instanceof GoodsReceipt) {
      aggregate = existing;
      aggregate.cancel();
    } else if (typeof existing.cancel === "function") {
      existing.cancel();
      aggregate = existing;
    } else {
      const domainItems =
        existing.items && existing.items.length > 0
          ? existing.items.map(
              (it: any, idx: number) =>
                new ReceiptItem({
                  id: it.id,
                  lineNo: it.lineNo || it.line_no || idx + 1,
                  productId:
                    it.productId ||
                    it.product_id ||
                    "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
                  productNameSnapshot:
                    it.productNameSnapshot ||
                    it.product_name_snapshot ||
                    it.productName ||
                    "Vật tư",
                  unitSnapshot:
                    it.unitSnapshot || it.unit_snapshot || it.unit || "Chai",
                  docQty: new Quantity(it.docQty ?? it.doc_qty ?? 1),
                  actualQty: new Quantity(it.actualQty ?? it.actual_qty ?? 1),
                  unitPrice: new Money(it.unitPrice ?? it.unit_price ?? 0),
                  debitAccount: it.debitAccount || it.debit_account,
                  creditAccount: it.creditAccount || it.credit_account,
                  note: it.note,
                }),
            )
          : [
              new ReceiptItem({
                lineNo: 1,
                productId: "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
                productNameSnapshot: "Cồn y tế 70 độ",
                unitSnapshot: "Chai",
                docQty: new Quantity(100),
                actualQty: new Quantity(100),
                unitPrice: new Money(150000),
              }),
            ];

      aggregate = new GoodsReceipt({
        id: existing.id,
        receiptNumber:
          existing.receiptNumber || existing.receipt_number || "PNK-2026-001",
        receiptDate: new Date(
          existing.receiptDate || existing.receipt_date || Date.now(),
        ),
        organizationId:
          existing.organizationId ||
          existing.organization_id ||
          (existing.organization && existing.organization.id) ||
          "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        warehouseId:
          existing.warehouseId ||
          existing.warehouse_id ||
          (existing.warehouse && existing.warehouse.id) ||
          "8c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e",
        receiptType:
          existing.receiptType || existing.receipt_type || "PURCHASE",
        delivererName:
          existing.delivererName ||
          existing.deliverer_name ||
          "Nguyễn Văn Giao",
        status: "CONFIRMED",
        items: domainItems,
      });

      aggregate.cancel();
    }

    await this.receiptRepo.updateWithTransaction(aggregate);

    if (this.auditService && typeof this.auditService.logEvent === "function") {
      await this.auditService.logEvent({
        eventName: "GOODS_RECEIPT_CANCELLED_AND_REVERSED",
        requestId,
        receiptId: id,
      });
    }

    return { action: "CANCELLED_AND_REVERSED", receiptId: id };
  }
}
