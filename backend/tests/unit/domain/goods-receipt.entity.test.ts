// tests/unit/domain/goods-receipt.entity.test.ts
import { describe, expect, it } from "vitest";

import { GoodsReceipt } from "#/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

describe("[Domain - Aggregate Root] GoodsReceipt", () => {
  const createSampleItem = (
    lineNo: number,
    name: string,
    unit: string,
    actualQty: number,
    price: number,
  ): ReceiptItem => {
    return new ReceiptItem({
      productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
      lineNo,
      productNameSnapshot: name,
      unitSnapshot: unit,
      docQty: new Quantity(actualQty),
      actualQty: new Quantity(actualQty),
      unitPrice: new Money(price),
    });
  };

  const baseReceiptProps = {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    receiptNumber: "PNK-2026-0001",
    receiptDate: new Date("2026-08-18"),
    actualReceivedDate: new Date("2026-08-18"),
    organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
    receiptType: "PURCHASE" as const,
    description: "Nhập kho thép cuộn theo HĐ 99882",
    delivererName: "Nguyễn Văn A",
    docReference: "HĐ-99882",
    docDate: new Date("2026-08-17"),
    docOrigin: "Công ty Thép Việt Nhật",
    debitAccount: "152",
    creditAccount: "331",
    attachedDocCount: "1 hóa đơn GTGT gốc",
    creatorName: "Lê Văn Lập",
    storekeeperName: "Trần Văn Kho",
    chiefAccountantName: "Phạm Thị Trưởng",
    status: "DRAFT" as const,
    items: [createSampleItem(1, "Thép cuộn Phi 6", "Kg", 98.5, 15000)],
  };

  it("TC-AGG-GR-01: Phải tạo thành công GoodsReceipt khi có đầy đủ Header và tối thiểu 1 dòng items", () => {
    const receipt = new GoodsReceipt(baseReceiptProps);

    expect(receipt.id).toBe(baseReceiptProps.id);
    expect(receipt.receiptNumber).toBe("PNK-2026-0001");
    expect(receipt.delivererName).toBe("Nguyễn Văn A");
    expect(receipt.status).toBe("DRAFT");
    expect(receipt.items.length).toBe(1);
  });

  it("TC-AGG-GR-02: Phải ném lỗi khi receiptNumber rỗng hoặc chỉ chứa khoảng trắng", () => {
    expect(() => {
      new GoodsReceipt({
        ...baseReceiptProps,
        receiptNumber: "   ",
      });
    }).toThrow("Số phiếu không được để trống.");
  });

  it("TC-AGG-GR-03: Phải ném lỗi khi delivererName rỗng hoặc chỉ chứa khoảng trắng", () => {
    expect(() => {
      new GoodsReceipt({
        ...baseReceiptProps,
        delivererName: "",
      });
    }).toThrow("Tên người giao hàng không được để trống.");
  });

  it("TC-AGG-GR-04: Phải ném lỗi khi mảng items rỗng (items.length === 0)", () => {
    expect(() => {
      new GoodsReceipt({
        ...baseReceiptProps,
        items: [],
      });
    }).toThrow("Phiếu nhập kho phải chứa ít nhất một dòng hàng hóa.");
  });

  it("TC-AGG-GR-05: Phương thức calculateTotalAmount() phải tính tổng chính xác bằng tổng Cột 4 của toàn bộ các dòng hàng", () => {
    const item1 = createSampleItem(1, "Thép cuộn Phi 6", "Kg", 98.5, 15000); // 1,477,500
    const item2 = createSampleItem(2, "Xi măng PCB40", "Bao", 10, 50000); // 500,000

    const receipt = new GoodsReceipt({
      ...baseReceiptProps,
      items: [item1, item2],
    });

    expect(receipt.calculateTotalAmount().value).toBe(1977500);
  });

  it("TC-AGG-GR-06: Phương thức confirm() phải chuyển trạng thái từ DRAFT sang CONFIRMED", () => {
    const receipt = new GoodsReceipt(baseReceiptProps);
    receipt.confirm();

    expect(receipt.status).toBe("CONFIRMED");
  });

  it("TC-AGG-GR-07: Phương thức confirm() phải ném lỗi nếu phiếu đang ở trạng thái CANCELLED", () => {
    const receipt = new GoodsReceipt({
      ...baseReceiptProps,
      status: "CANCELLED",
    });

    expect(() => receipt.confirm()).toThrow("Không thể duyệt phiếu đã bị hủy.");
  });

  it("TC-AGG-GR-08: Phương thức cancel() phải chuyển trạng thái sang CANCELLED", () => {
    const receipt = new GoodsReceipt({
      ...baseReceiptProps,
      status: "CONFIRMED",
    });
    receipt.cancel();

    expect(receipt.status).toBe("CANCELLED");
  });

  it("TC-AGG-GR-09: Phương thức cancel() phải ném lỗi nếu phiếu đã ở trạng thái CANCELLED trước đó", () => {
    const receipt = new GoodsReceipt({
      ...baseReceiptProps,
      status: "CANCELLED",
    });

    expect(() => receipt.cancel()).toThrow(
      "Phiếu này đã ở trạng thái hủy trước đó.",
    );
  });

  it("TC-AGG-GR-10: Thuộc tính items trả về phải là bản sao bất biến, không làm thay đổi mảng nội bộ khi push", () => {
    const receipt = new GoodsReceipt(baseReceiptProps);
    const exposedItems = receipt.items;
    const newItem = createSampleItem(2, "Cát xây dựng", "m3", 5, 200000);

    exposedItems.push(newItem);

    expect(receipt.items.length).toBe(1);
  });
});
