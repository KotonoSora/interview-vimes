// tests/unit/application/update-goods-receipt.use-case.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpdateGoodsReceiptDTO } from "#/application/dtos/update-goods-receipt.dto";
import { UpdateGoodsReceiptUseCase } from "#/application/use-cases/update-goods-receipt.use-case";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";

describe("[Application - Use Case] UpdateGoodsReceiptUseCase", () => {
  let mockReceiptRepo: IGoodsReceiptRepository;
  let mockAuditService: AuditTrailService;
  let useCase: UpdateGoodsReceiptUseCase;

  const createExistingReceipt = (
    status: "DRAFT" | "CONFIRMED" | "CANCELLED",
  ) => {
    return new GoodsReceipt({
      id: "receipt-uuid-1",
      receiptNumber: "PNK-2026-0001",
      receiptDate: new Date("2026-08-18"),
      organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
      receiptType: "PURCHASE",
      delivererName: "Nguyễn Văn A",
      status,
      items: [
        new ReceiptItem({
          productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
          lineNo: 1,
          productNameSnapshot: "Thép cuộn Phi 6",
          unitSnapshot: "Kg",
          docQty: new Quantity(100),
          actualQty: new Quantity(98.5),
          unitPrice: new Money(15000),
        }),
      ],
    });
  };

  const updateDTO: UpdateGoodsReceiptDTO = {
    delivererName: "Nguyễn Văn B (Updated)",
    items: [
      {
        lineNo: 1,
        productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
        productNameSnapshot: "Cồn Y Tế 70 độ",
        unitSnapshot: "Chai",
        docQty: 100,
        actualQty: 100,
        unitPrice: 15000,
      },
    ],
  };

  beforeEach(() => {
    mockReceiptRepo = {
      findById: vi.fn(),
      updateWithTransaction: vi.fn().mockResolvedValue(undefined),
      findByReceiptNumber: vi.fn(),
      saveWithTransaction: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as IGoodsReceiptRepository;

    mockAuditService = {
      logEvent: vi.fn(),
    } as unknown as AuditTrailService;

    useCase = new UpdateGoodsReceiptUseCase(mockReceiptRepo, mockAuditService);
  });

  it("TC-UC-UPDATE-01: Phải cập nhật thành công khi phiếu tồn tại và đang ở trạng thái DRAFT", () => {
    const existingReceipt = createExistingReceipt("DRAFT");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(existingReceipt);

    return useCase
      .execute("receipt-uuid-1", updateDTO, "trace-id-1")
      .then((result) => {
        expect(mockReceiptRepo.updateWithTransaction).toHaveBeenCalledOnce();
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            eventName: "GOODS_RECEIPT_UPDATED",
            receiptId: "receipt-uuid-1",
          }),
        );
        expect(result.receiptId).toBe("receipt-uuid-1");
      });
  });

  it("TC-UC-UPDATE-02: Phải cập nhật và điều chỉnh tồn kho thành công khi phiếu đang ở trạng thái CONFIRMED", () => {
    const existingReceipt = createExistingReceipt("CONFIRMED");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(existingReceipt);

    return useCase
      .execute("receipt-uuid-1", updateDTO, "trace-id-2")
      .then((result) => {
        expect(mockReceiptRepo.updateWithTransaction).toHaveBeenCalledOnce();
        expect(result.totalAmount).toBe(1500000);
      });
  });

  it("TC-UC-UPDATE-03: Phải ném lỗi khi không tìm thấy id phiếu nhập", () => {
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(null);

    return expect(useCase.execute("non-existing-id", updateDTO))
      .rejects.toThrow("Không tìm thấy phiếu nhập kho với ID đã cung cấp.")
      .then(() => {
        expect(mockReceiptRepo.updateWithTransaction).not.toHaveBeenCalled();
      });
  });

  it("TC-UC-UPDATE-04: Phải ném lỗi từ chối cập nhật khi phiếu đang ở trạng thái CANCELLED", () => {
    const existingReceipt = createExistingReceipt("CANCELLED");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(existingReceipt);

    return expect(useCase.execute("receipt-uuid-1", updateDTO))
      .rejects.toThrow(
        "Không thể chỉnh sửa phiếu nhập đã ở trạng thái CANCELLED.",
      )
      .then(() => {
        expect(mockReceiptRepo.updateWithTransaction).not.toHaveBeenCalled();
      });
  });
});
