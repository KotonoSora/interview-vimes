// tests/unit/domain/money.vo.test.ts
import { describe, it, expect } from "vitest";
import { Money } from "#/domain/value-objects/money.vo";

describe("[Domain - Value Object] Money", () => {
  it("TC-VO-MONEY-01: Phải tạo thành công và truy xuất chính xác qua getter value và amount", () => {
    const money = new Money(150000.456);
    expect(money.value).toBe(150000.46);
    expect(money.amount).toBe(150000.46);
  });

  it("TC-VO-MONEY-02: Phải ném lỗi khi khởi tạo số tiền âm hoặc NaN", () => {
    expect(() => new Money(-100)).toThrow(
      "Số tiền không hợp lệ hoặc không được âm.",
    );
    expect(() => new Money(NaN)).toThrow(
      "Số tiền không hợp lệ hoặc không được âm.",
    );
  });

  it("TC-VO-MONEY-03: Phải thực hiện phép cộng 2 đối tượng Money chính xác", () => {
    const m1 = new Money(100.25);
    const m2 = new Money(50.75);
    const result = m1.add(m2);

    expect(result.value).toBe(151);
  });

  it("TC-VO-MONEY-04: Phải thực hiện phép nhân với số lượng chính xác", () => {
    const m = new Money(15000);
    const result = m.multiply(3.5);

    expect(result.value).toBe(52500);
  });

  it("TC-VO-MONEY-05: Phải ném lỗi khi nhân với hệ số âm", () => {
    const m = new Money(15000);
    expect(() => m.multiply(-2)).toThrow("Số lượng nhân không được âm.");
  });
});
