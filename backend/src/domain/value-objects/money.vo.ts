// src/domain/value-objects/money.vo.ts
export class Money {
  private readonly _value: number;

  constructor(value: number) {
    if (isNaN(value) || value < 0) {
      throw new Error("Số tiền không hợp lệ hoặc không được âm.");
    }
    this._value = Math.round((value + Number.EPSILON) * 100) / 100;
  }

  public get value(): number {
    return this._value;
  }

  public get amount(): number {
    return this._value;
  }

  public add(other: Money): Money {
    return new Money(
      Math.round((this._value + other.value + Number.EPSILON) * 100) / 100,
    );
  }

  public multiply(quantity: number): Money {
    if (quantity < 0) {
      throw new Error("Số lượng nhân không được âm.");
    }
    return new Money(
      Math.round((this._value * quantity + Number.EPSILON) * 100) / 100,
    );
  }
}
