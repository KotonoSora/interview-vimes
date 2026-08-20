// src/domain/value-objects/quantity.vo.ts
export class Quantity {
  private readonly _value: number;

  constructor(value: number) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new Error("Số lượng không được âm.");
    }
    this._value = Math.round((value + Number.EPSILON) * 1000) / 1000;
  }

  public get value(): number {
    return this._value;
  }
}
