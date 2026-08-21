// tests/unit/domain/receipt-item.entity.test.ts
import { describe, expect, it } from "vitest";

import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

describe("[Domain - Entity] ReceiptItem", () => {
  const baseItemProps = {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
    lineNo: 1,
    productNameSnapshot: "Thép cuộn Phi 6",
    unitSnapshot: "Kg",
    docQty: new Quantity(100),
    actualQty: new Quantity(98.5),
    unitPrice: new Money(15000),
    debitAccount: "152",
    creditAccount: "331",
    note: "Hao hụt 1.5kg do vận chuyển",
  };

  it("TC-ENT-ITEM-01: Phải tạo thành công thực thể ReceiptItem khi truyền đầy đủ thuộc tính hợp lệ", () => {
    const item = new ReceiptItem(baseItemProps);

    expect(item.id).toBe(baseItemProps.id);
    expect(item.productId).toBe(baseItemProps.productId);
    expect(item.lineNo).toBe(1);
    expect(item.productNameSnapshot).toBe("Thép cuộn Phi 6");
    expect(item.unitSnapshot).toBe("Kg");
    expect(item.docQty.value).toBe(100);
    expect(item.actualQty.value).toBe(98.5);
    expect(item.unitPrice.value).toBe(15000);
  });

  it("TC-ENT-ITEM-02: Phải ném lỗi khi productNameSnapshot rỗng hoặc chỉ chứa khoảng trắng", () => {
    expect(() => {
      new ReceiptItem({
        ...baseItemProps,
        productNameSnapshot: "   ",
      });
    }).toThrow("Tên quy cách vật tư không được để trống.");
  });

  it("TC-ENT-ITEM-03: Phải ném lỗi khi unitSnapshot rỗng hoặc chỉ chứa khoảng trắng", () => {
    expect(() => {
      new ReceiptItem({
        ...baseItemProps,
        unitSnapshot: "",
      });
    }).toThrow("Đơn vị tính không được để trống.");
  });

  it("TC-ENT-ITEM-04: Phương thức calculateAmount() phải tính chính xác Cột 4 = Cột 2 (SL Thực nhập) * Cột 3 (Đơn giá)", () => {
    const item = new ReceiptItem(baseItemProps);
    const amount = item.calculateAmount();

    expect(amount.value).toBe(1477500);
  });

  it("TC-ENT-ITEM-05: Phương thức calculateAmount() không được lấy docQty để tính thành tiền kể cả khi docQty khác actualQty", () => {
    const item = new ReceiptItem({
      ...baseItemProps,
      docQty: new Quantity(200),
      actualQty: new Quantity(98.5),
      unitPrice: new Money(15000),
    });

    expect(item.calculateAmount().value).toBe(1477500);
    expect(item.calculateAmount().value).not.toBe(3000000);
  });
});
