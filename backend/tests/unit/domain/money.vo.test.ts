// tests/unit/domain/money.vo.test.ts
import { describe, it, expect } from "vitest";
import { Money } from "#/domain/value-objects/money.vo";

describe("[Domain - Value Object] Money", () => {
  it("TC-VO-MONEY-01: Phải khởi tạo thành công khi số tiền là số dương hợp lệ", () => {
    const money = new Money(15000);
    expect(money.value).toBe(15000);
  });

  it("TC-VO-MONEY-02: Phải khởi tạo thành công khi số tiền bằng 0", () => {
    const money = new Money(0);
    expect(money.value).toBe(0);
  });

  it("TC-VO-MONEY-03: Phải ném lỗi khi khởi tạo với số tiền âm", () => {
    expect(() => new Money(-500)).toThrow(
      "Số tiền không hợp lệ hoặc không được âm.",
    );
  });

  it("TC-VO-MONEY-04: Phải ném lỗi khi khởi tạo với giá trị NaN", () => {
    expect(() => new Money(Number.NaN)).toThrow(
      "Số tiền không hợp lệ hoặc không được âm.",
    );
  });

  it("TC-VO-MONEY-05: Phải làm tròn chính xác 2 chữ số thập phân khi khởi tạo", () => {
    const money = new Money(15000.556);
    expect(money.value).toBe(15000.56);
  });

  it("TC-VO-MONEY-06: Phương thức add() phải cộng chính xác hai đối tượng Money mà không bị sai số floating-point", () => {
    const moneyA = new Money(0.1);
    const moneyB = new Money(0.2);
    const sum = moneyA.add(moneyB);

    expect(sum.value).toBe(0.3);
  });

  it("TC-VO-MONEY-07: Phương thức multiply() phải nhân chính xác số tiền với hệ số số lượng và làm tròn 2 chữ số thập phân", () => {
    const unitPrice = new Money(15000);
    const amount = unitPrice.multiply(98.5);

    expect(amount.value).toBe(1477500);
  });
});
