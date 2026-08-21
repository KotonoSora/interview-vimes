// tests/unit/application/create-goods-receipt.dto.test.ts
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { CreateGoodsReceiptSchema } from "#/application/dtos/create-goods-receipt.dto";

describe("[Application - DTO Validation] CreateGoodsReceiptSchema", () => {
  const validPayload = {
    receiptNumber: "PNK-2026-0001",
    receiptDate: "2026-08-18",
    actualReceivedDate: "2026-08-18",
    organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
    receiptType: "PURCHASE" as const,
    description: "Nhập kho thép cuộn theo HĐ 99882",
    delivererName: "Nguyễn Văn A",
    docReference: "HĐ-99882",
    docDate: "2026-08-17",
    docOrigin: "Công ty Thép Việt Nhật",
    debitAccount: "152",
    creditAccount: "331",
    totalAmountWords: "Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng",
    attachedDocCount: "1 hóa đơn GTGT gốc",
    creatorName: "Lê Văn Lập",
    storekeeperName: "Trần Văn Kho",
    chiefAccountantName: "Phạm Thị Trưởng",
    status: "CONFIRMED" as const,
    items: [
      {
        productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
        productNameSnapshot: "Thép cuộn Phi 6",
        unitSnapshot: "Kg",
        docQty: 100,
        actualQty: 98.5,
        unitPrice: 15000,
        debitAccount: "152",
        creditAccount: "331",
        note: "Hao hụt 1.5kg do vận chuyển",
      },
    ],
  };

  it("TC-DTO-01: Phải parse thành công khi truyền payload hợp lệ đúng chuẩn schema", () => {
    const parsed = CreateGoodsReceiptSchema.parse(validPayload);
    expect(parsed.receiptNumber).toBe("PNK-2026-0001");
    expect(parsed.items.length).toBe(1);
  });

  it("TC-DTO-02: Phải ném lỗi ZodError khi thiếu các trường bắt buộc", () => {
    const invalidPayload = { ...validPayload };
    delete (invalidPayload as any).receiptNumber;

    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-03: Phải ném lỗi ZodError khi receiptDate sai định dạng YYYY-MM-DD", () => {
    const invalidPayload = { ...validPayload, receiptDate: "18-08-2026" };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-04: Phải ném lỗi ZodError khi organizationId hoặc warehouseId không phải định dạng UUID", () => {
    const invalidPayload = {
      ...validPayload,
      organizationId: "invalid-uuid-123",
    };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-05: Phải ném lỗi ZodError khi docQty, actualQty hoặc unitPrice là số âm", () => {
    const invalidPayload = {
      ...validPayload,
      items: [
        {
          ...validPayload.items[0],
          actualQty: -10,
        },
      ],
    };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-06: Phải ném lỗi ZodError khi receiptType không thuộc enum quy định", () => {
    const invalidPayload = {
      ...validPayload,
      receiptType: "UNKNOWN_TYPE" as any,
    };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-07: Phải ném lỗi ZodError khi mảng items có độ dài bằng 0", () => {
    const invalidPayload = { ...validPayload, items: [] };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });

  it("TC-DTO-08: Phải ném lỗi khi payload chứa trường lạ không được khai báo nhờ cờ .strict()", () => {
    const invalidPayload = {
      ...validPayload,
      maliciousField: "INJECTED_VALUE",
    };
    expect(() => CreateGoodsReceiptSchema.parse(invalidPayload)).toThrow(
      ZodError,
    );
  });
});
