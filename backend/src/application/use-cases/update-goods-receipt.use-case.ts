// src/application/use-cases/update-goods-receipt.use-case.ts
import { UpdateGoodsReceiptDTO } from "#/application/dtos/update-goods-receipt.dto";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import {
  DomainUnprocessableError,
  EntityNotFoundError,
} from "#/domain/exceptions/domain.exception";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

export class UpdateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService?: any,
  ) {}

  async execute(
    id: string,
    dto: UpdateGoodsReceiptDTO,
    requestId?: string,
  ): Promise<{ receiptId: string; totalAmount: number }> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("phiếu nhập kho", id);
    }

    if (existing.status === "CANCELLED") {
      throw new DomainUnprocessableError(
        "Không thể chỉnh sửa phiếu nhập đã ở trạng thái CANCELLED.",
      );
    }

    const receiptNumber =
      existing.receiptNumber ||
      existing.receipt_number ||
      (typeof existing.toProps === "function"
        ? existing.toProps().receiptNumber
        : "");

    const organizationId =
      (dto as any).organizationId ||
      existing.organizationId ||
      existing.organization_id ||
      (existing.organization && existing.organization.id) ||
      (typeof existing.toProps === "function"
        ? existing.toProps().organizationId
        : "");

    const warehouseId =
      (dto as any).warehouseId ||
      existing.warehouseId ||
      existing.warehouse_id ||
      (existing.warehouse && existing.warehouse.id) ||
      (typeof existing.toProps === "function"
        ? existing.toProps().warehouseId
        : "");

    const receiptDate = dto.receiptDate
      ? new Date(dto.receiptDate)
      : new Date(existing.receiptDate || existing.receipt_date || Date.now());

    const actualReceivedDate = dto.actualReceivedDate
      ? new Date(dto.actualReceivedDate)
      : existing.actualReceivedDate || existing.actual_received_date
        ? new Date(existing.actualReceivedDate || existing.actual_received_date)
        : undefined;

    const receiptType =
      dto.receiptType ||
      existing.receiptType ||
      existing.receipt_type ||
      "PURCHASE";
    const delivererName =
      dto.delivererName || existing.delivererName || existing.deliverer_name;
    const docReference =
      dto.docReference !== undefined
        ? dto.docReference
        : existing.docReference || existing.doc_reference;
    const docDate =
      dto.docDate !== undefined
        ? dto.docDate
          ? new Date(dto.docDate)
          : undefined
        : existing.docDate || existing.doc_date;
    const docOrigin =
      dto.docOrigin !== undefined
        ? dto.docOrigin
        : existing.docOrigin || existing.doc_origin;
    const debitAccount =
      dto.debitAccount !== undefined
        ? dto.debitAccount
        : existing.debitAccount || existing.debit_account;
    const creditAccount =
      dto.creditAccount !== undefined
        ? dto.creditAccount
        : existing.creditAccount || existing.credit_account;
    const description =
      dto.description !== undefined ? dto.description : existing.description;
    const totalAmountWords =
      dto.totalAmountWords !== undefined
        ? dto.totalAmountWords
        : existing.totalAmountWords || existing.total_amount_words;
    const attachedDocCount =
      dto.attachedDocCount !== undefined
        ? dto.attachedDocCount
        : existing.attachedDocCount || existing.attached_doc_count;
    const creatorName =
      dto.creatorName !== undefined
        ? dto.creatorName
        : existing.creatorName || existing.creator_name;
    const storekeeperName =
      dto.storekeeperName !== undefined
        ? dto.storekeeperName
        : existing.storekeeperName || existing.storekeeper_name;
    const chiefAccountantName =
      dto.chiefAccountantName !== undefined
        ? dto.chiefAccountantName
        : existing.chiefAccountantName || existing.chief_accountant_name;
    const status = existing.status;

    let domainItems: ReceiptItem[] = [];
    if (dto.items && dto.items.length > 0) {
      domainItems = dto.items.map(
        (it, idx) =>
          new ReceiptItem({
            lineNo: it.lineNo ?? idx + 1,
            productId: it.productId,
            productNameSnapshot: it.productNameSnapshot,
            unitSnapshot: it.unitSnapshot,
            docQty: new Quantity(it.docQty),
            actualQty: new Quantity(it.actualQty),
            unitPrice: new Money(it.unitPrice),
            debitAccount: it.debitAccount ?? undefined,
            creditAccount: it.creditAccount ?? undefined,
            note: it.note ?? undefined,
          }),
      );
    } else if (existing.items && existing.items.length > 0) {
      domainItems = existing.items.map(
        (it: any, idx: number) =>
          new ReceiptItem({
            lineNo: it.lineNo ?? it.line_no ?? idx + 1,
            productId: it.productId ?? it.product_id,
            productNameSnapshot:
              it.productNameSnapshot ??
              it.product_name_snapshot ??
              it.productName,
            unitSnapshot: it.unitSnapshot ?? it.unit_snapshot ?? it.unit,
            docQty: new Quantity(it.docQty ?? it.doc_qty),
            actualQty: new Quantity(it.actualQty ?? it.actual_qty),
            unitPrice: new Money(it.unitPrice ?? it.unit_price),
            debitAccount: it.debitAccount ?? it.debit_account,
            creditAccount: it.creditAccount ?? it.credit_account,
            note: it.note,
          }),
      );
    }

    const updatedEntity = new GoodsReceipt({
      id,
      receiptNumber,
      organizationId,
      warehouseId,
      receiptDate,
      actualReceivedDate,
      receiptType,
      delivererName,
      docReference: docReference ?? undefined,
      docDate: docDate ? new Date(docDate) : undefined,
      docOrigin: docOrigin ?? undefined,
      debitAccount: debitAccount ?? undefined,
      creditAccount: creditAccount ?? undefined,
      description: description ?? undefined,
      totalAmountWords: totalAmountWords ?? undefined,
      attachedDocCount: attachedDocCount ?? undefined,
      creatorName: creatorName ?? undefined,
      storekeeperName: storekeeperName ?? undefined,
      chiefAccountantName: chiefAccountantName ?? undefined,
      status,
      items: domainItems,
    });

    await this.receiptRepo.updateWithTransaction(updatedEntity);

    if (this.auditService && typeof this.auditService.logEvent === "function") {
      await this.auditService.logEvent({
        eventName: "GOODS_RECEIPT_UPDATED",
        requestId,
        receiptId: id,
      });
    }

    return {
      receiptId: id,
      totalAmount: updatedEntity.calculateTotalAmount().value,
    };
  }
}
