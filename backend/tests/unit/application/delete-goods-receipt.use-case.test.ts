// tests/unit/application/delete-goods-receipt.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteGoodsReceiptUseCase } from "#/application/use-cases/delete-goods-receipt.use-case";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";
import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Quantity } from "#/domain/value-objects/quantity.vo";
import { Money } from "#/domain/value-objects/money.vo";

describe("[Application - Use Case] DeleteGoodsReceiptUseCase", () => {
  let mockReceiptRepo: IGoodsReceiptRepository;
  let mockAuditService: AuditTrailService;
  let useCase: DeleteGoodsReceiptUseCase;

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

  beforeEach(() => {
    mockReceiptRepo = {
      findById: vi.fn(),
      deleteById: vi.fn().mockResolvedValue(undefined),
      updateWithTransaction: vi.fn().mockResolvedValue(undefined),
      findByReceiptNumber: vi.fn(),
      saveWithTransaction: vi.fn(),
    } as unknown as IGoodsReceiptRepository;

    mockAuditService = {
      logEvent: vi.fn(),
    } as unknown as AuditTrailService;

    useCase = new DeleteGoodsReceiptUseCase(mockReceiptRepo, mockAuditService);
  });

  it("TC-UC-DELETE-01: Phải thực thi Xóa cứng (Hard Delete) khi phiếu ở trạng thái DRAFT", () => {
    const draftReceipt = createExistingReceipt("DRAFT");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(draftReceipt);

    return useCase.execute("receipt-uuid-1", "trace-id-1").then((result) => {
      expect(mockReceiptRepo.deleteById).toHaveBeenCalledWith("receipt-uuid-1");
      expect(mockReceiptRepo.updateWithTransaction).not.toHaveBeenCalled();
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "GOODS_RECEIPT_HARD_DELETED",
          receiptId: "receipt-uuid-1",
        }),
      );
      expect(result).toEqual({
        receiptId: "receipt-uuid-1",
        action: "HARD_DELETED",
      });
    });
  });

  it("TC-UC-DELETE-02: Phải thực thi Hủy chứng từ & Hoàn kho (Stock Reversal) khi phiếu ở trạng thái CONFIRMED", () => {
    const confirmedReceipt = createExistingReceipt("CONFIRMED");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(confirmedReceipt);

    return useCase.execute("receipt-uuid-1", "trace-id-2").then((result) => {
      expect(mockReceiptRepo.deleteById).not.toHaveBeenCalled();
      expect(mockReceiptRepo.updateWithTransaction).toHaveBeenCalledOnce();
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "GOODS_RECEIPT_CANCELLED_AND_REVERSED",
          receiptId: "receipt-uuid-1",
        }),
      );
      expect(result).toEqual({
        receiptId: "receipt-uuid-1",
        action: "CANCELLED_AND_REVERSED",
      });
    });
  });

  it("TC-UC-DELETE-03: Phải ném lỗi khi chứng từ không tồn tại", () => {
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(null);

    return expect(useCase.execute("non-existing-id"))
      .rejects.toThrow("Không tìm thấy phiếu nhập kho với ID đã cung cấp.")
      .then(() => {
        expect(mockReceiptRepo.deleteById).not.toHaveBeenCalled();
        expect(mockReceiptRepo.updateWithTransaction).not.toHaveBeenCalled();
      });
  });

  it("TC-UC-DELETE-04: Phải ném lỗi khi cố tình hủy phiếu đã ở trạng thái CANCELLED", () => {
    const cancelledReceipt = createExistingReceipt("CANCELLED");
    vi.mocked(mockReceiptRepo.findById).mockResolvedValueOnce(cancelledReceipt);

    return expect(useCase.execute("receipt-uuid-1"))
      .rejects.toThrow("Phiếu này đã ở trạng thái hủy trước đó.")
      .then(() => {
        expect(mockReceiptRepo.deleteById).not.toHaveBeenCalled();
        expect(mockReceiptRepo.updateWithTransaction).not.toHaveBeenCalled();
      });
  });
});
