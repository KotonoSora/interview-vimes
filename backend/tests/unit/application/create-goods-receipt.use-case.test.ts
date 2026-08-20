// tests/unit/application/create-goods-receipt.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateGoodsReceiptUseCase } from "#/application/use-cases/create-goods-receipt.use-case";
import { IGoodsReceiptRepository } from "#/domain/repositories/goods-receipt.repository.interface";
import { AuditTrailService } from "#/infrastructure/analytics/audit-trail.service";
import { CreateGoodsReceiptDTO } from "#/application/dtos/create-goods-receipt.dto";

describe("[Application - Use Case] CreateGoodsReceiptUseCase", () => {
  let mockReceiptRepo: IGoodsReceiptRepository;
  let mockAuditService: AuditTrailService;
  let useCase: CreateGoodsReceiptUseCase;

  const validDTO: CreateGoodsReceiptDTO = {
    receiptNumber: "PNK-2026-0001",
    receiptDate: "2026-08-18",
    actualReceivedDate: "2026-08-18",
    organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
    receiptType: "PURCHASE",
    description: "Nhập kho theo HĐ 99882",
    delivererName: "Nguyễn Văn A",
    totalAmountWords: "Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng",
    status: "CONFIRMED",
    items: [
      {
        productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
        productNameSnapshot: "Thép cuộn Phi 6",
        unitSnapshot: "Kg",
        docQty: 100,
        actualQty: 98.5,
        unitPrice: 15000,
      },
    ],
  };

  beforeEach(() => {
    mockReceiptRepo = {
      findByReceiptNumber: vi.fn().mockResolvedValue(null),
      saveWithTransaction: vi
        .fn()
        .mockResolvedValue("generated-uuid-receipt-id"),
      findById: vi.fn(),
      updateWithTransaction: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as IGoodsReceiptRepository;

    mockAuditService = {
      logEvent: vi.fn(),
    } as unknown as AuditTrailService;

    useCase = new CreateGoodsReceiptUseCase(mockReceiptRepo, mockAuditService);
  });

  it("TC-UC-CREATE-01: Phải tạo phiếu thành công, gọi saveWithTransaction, log audit và trả về kết quả đúng", () => {
    return useCase.execute(validDTO, "req-trace-id-123").then((result) => {
      expect(mockReceiptRepo.findByReceiptNumber).toHaveBeenCalledWith(
        "PNK-2026-0001",
      );
      expect(mockReceiptRepo.saveWithTransaction).toHaveBeenCalledOnce();
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "GOODS_RECEIPT_CREATED",
          requestId: "req-trace-id-123",
          receiptId: "generated-uuid-receipt-id",
          totalAmount: 1477500,
        }),
      );
      expect(result).toEqual({
        receiptId: "generated-uuid-receipt-id",
        totalAmount: 1477500,
      });
    });
  });

  it("TC-UC-CREATE-02: Phải ném lỗi và dừng xử lý nếu số phiếu đã tồn tại", () => {
    vi.mocked(mockReceiptRepo.findByReceiptNumber).mockResolvedValueOnce(
      {} as any,
    );

    return expect(useCase.execute(validDTO))
      .rejects.toThrow("Số phiếu PNK-2026-0001 đã tồn tại trên hệ thống.")
      .then(() => {
        expect(mockReceiptRepo.saveWithTransaction).not.toHaveBeenCalled();
        expect(mockAuditService.logEvent).not.toHaveBeenCalled();
      });
  });

  it("TC-UC-CREATE-03: Phải gán đúng số thứ tự lineNo tăng dần từ 1..N cho từng item", () => {
    const multiItemDTO: CreateGoodsReceiptDTO = {
      ...validDTO,
      items: [
        validDTO.items[0],
        {
          productId: "a1a2a3a4-1234-4567-89ab-cdef01234567",
          productNameSnapshot: "Xi măng PCB40",
          unitSnapshot: "Bao",
          docQty: 10,
          actualQty: 10,
          unitPrice: 50000,
        },
      ],
    };

    return useCase.execute(multiItemDTO).then(() => {
      const savedReceipt = vi.mocked(mockReceiptRepo.saveWithTransaction).mock
        .calls[0][0];
      expect(savedReceipt.items[0].lineNo).toBe(1);
      expect(savedReceipt.items[1].lineNo).toBe(2);
    });
  });

  it("TC-UC-CREATE-04: Phải ánh xạ đúng trạng thái mặc định là CONFIRMED nếu DTO không truyền status", () => {
    const dtoWithoutStatus = { ...validDTO };
    delete (dtoWithoutStatus as any).status;

    return useCase.execute(dtoWithoutStatus).then(() => {
      const savedReceipt = vi.mocked(mockReceiptRepo.saveWithTransaction).mock
        .calls[0][0];
      expect(savedReceipt.status).toBe("CONFIRMED");
    });
  });

  it("TC-UC-CREATE-05: Phải đảm bảo nếu saveWithTransaction thất bại, audit log không được phép ghi", () => {
    vi.mocked(mockReceiptRepo.saveWithTransaction).mockRejectedValueOnce(
      new Error("DB Connection Timeout"),
    );

    return expect(useCase.execute(validDTO))
      .rejects.toThrow("DB Connection Timeout")
      .then(() => {
        expect(mockAuditService.logEvent).not.toHaveBeenCalled();
      });
  });
});
