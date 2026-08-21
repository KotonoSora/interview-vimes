// src/domain/entities/product.entity.ts
export interface ProductProps {
  id?: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice: number;
  isActive?: boolean;
}

export class Product {
  private readonly _id?: string;
  private readonly _code: string;
  private readonly _name: string;
  private readonly _unit: string;
  private readonly _defaultPrice: number;
  private readonly _isActive: boolean;

  constructor(props: ProductProps) {
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._unit = props.unit;
    this._defaultPrice = props.defaultPrice;
    this._isActive = props.isActive ?? true;
  }

  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get code(): string {
    return this._code;
  }
  public get name(): string {
    return this._name;
  }
  public get unit(): string {
    return this._unit;
  }
  public get defaultPrice(): number {
    return this._defaultPrice;
  }
  public get isActive(): boolean {
    return this._isActive;
  }

  public toJSON() {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      unit: this._unit,
      defaultPrice: this._defaultPrice,
      isActive: this._isActive,
    };
  }
}
