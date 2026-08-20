// src/domain/value-objects/money.vo.ts
export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
      throw new Error("Số tiền không hợp lệ hoặc không được âm.");
    }
    this._amount = Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  public get value(): number {
    return this._amount;
  }

  public add(other: Money): Money {
    return new Money(this._amount + other.value);
  }

  public multiply(quantity: number): Money {
    return new Money(this._amount * quantity);
  }
}
