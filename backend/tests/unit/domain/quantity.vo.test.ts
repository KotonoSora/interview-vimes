// tests/unit/domain/quantity.vo.test.ts
import { describe, it, expect } from "vitest";
import { Quantity } from "#/domain/value-objects/quantity.vo";

describe("[Domain - Value Object] Quantity", () => {
  it("TC-VO-QTY-01: Phải khởi tạo thành công khi số lượng là số dương hợp lệ", () => {
    const qty = new Quantity(100.5);
    expect(qty.value).toBe(100.5);
  });

  it("TC-VO-QTY-02: Phải khởi tạo thành công khi số lượng bằng 0", () => {
    const qty = new Quantity(0);
    expect(qty.value).toBe(0);
  });

  it("TC-VO-QTY-03: Phải ném lỗi khi số lượng là số âm", () => {
    expect(() => new Quantity(-1)).toThrow("Số lượng không được âm.");
  });

  it("TC-VO-QTY-04: Phải ném lỗi khi số lượng là NaN", () => {
    expect(() => new Quantity(Number.NaN)).toThrow("Số lượng không được âm.");
  });

  it("TC-VO-QTY-05: Phải làm tròn chính xác 3 chữ số thập phân cho đơn vị đo lường", () => {
    const qty = new Quantity(98.5556);
    expect(qty.value).toBe(98.556);
  });
});
