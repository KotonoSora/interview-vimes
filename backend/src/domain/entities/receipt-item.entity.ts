// src/domain/entities/receipt-item.entity.ts
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

export interface ReceiptItemProps {
  id?: string;
  lineNo: number;
  productId: string;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: Quantity | number;
  actualQty: Quantity | number;
  unitPrice: Money | number;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

export class ReceiptItem {
  private readonly _id?: string;
  private readonly _lineNo: number;
  private readonly _productId: string;
  private readonly _productNameSnapshot: string;
  private readonly _unitSnapshot: string;
  private readonly _docQty: Quantity;
  private readonly _actualQty: Quantity;
  private readonly _unitPrice: Money;
  private readonly _debitAccount?: string;
  private readonly _creditAccount?: string;
  private readonly _note?: string;

  constructor(props: ReceiptItemProps) {
    if (!props.productNameSnapshot || !props.productNameSnapshot.trim()) {
      throw new Error("Tên quy cách vật tư không được để trống.");
    }
    if (!props.unitSnapshot || !props.unitSnapshot.trim()) {
      throw new Error("Đơn vị tính không được để trống.");
    }

    const docQty =
      props.docQty instanceof Quantity
        ? props.docQty
        : new Quantity(props.docQty);
    const actualQty =
      props.actualQty instanceof Quantity
        ? props.actualQty
        : new Quantity(props.actualQty);
    const unitPrice =
      props.unitPrice instanceof Money
        ? props.unitPrice
        : new Money(props.unitPrice);

    this._id = props.id;
    this._lineNo = props.lineNo;
    this._productId = props.productId;
    this._productNameSnapshot = props.productNameSnapshot;
    this._unitSnapshot = props.unitSnapshot;
    this._docQty = docQty;
    this._actualQty = actualQty;
    this._unitPrice = unitPrice;
    this._debitAccount = props.debitAccount;
    this._creditAccount = props.creditAccount;
    this._note = props.note;
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get lineNo(): number {
    return this._lineNo;
  }
  public get productId(): string {
    return this._productId;
  }
  public get productNameSnapshot(): string {
    return this._productNameSnapshot;
  }
  public get unitSnapshot(): string {
    return this._unitSnapshot;
  }
  public get docQty(): Quantity {
    return this._docQty;
  }
  public get actualQty(): Quantity {
    return this._actualQty;
  }
  public get unitPrice(): Money {
    return this._unitPrice;
  }
  public get debitAccount(): string | undefined {
    return this._debitAccount;
  }
  public get creditAccount(): string | undefined {
    return this._creditAccount;
  }
  public get note(): string | undefined {
    return this._note;
  }

  public calculateAmount(): Money {
    return this._unitPrice.multiply(this._actualQty.value);
  }
}
