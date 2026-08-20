// src/domain/entities/receipt-item.entity.ts
import { Money } from "#/domain/value-objects/money.vo";
import { Quantity } from "#/domain/value-objects/quantity.vo";

export interface ReceiptItemProps {
  id?: string;
  productId: string;
  lineNo: number;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: Quantity;
  actualQty: Quantity;
  unitPrice: Money;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

export class ReceiptItem {
  public readonly id?: string;
  public readonly productId: string;
  public readonly lineNo: number;
  public readonly productNameSnapshot: string;
  public readonly unitSnapshot: string;
  public readonly docQty: Quantity;
  public readonly actualQty: Quantity;
  public readonly unitPrice: Money;
  public readonly debitAccount?: string;
  public readonly creditAccount?: string;
  public readonly note?: string;

  constructor(props: ReceiptItemProps) {
    if (!props.productNameSnapshot || !props.productNameSnapshot.trim()) {
      throw new Error("Tên quy cách vật tư không được để trống.");
    }
    if (!props.unitSnapshot || !props.unitSnapshot.trim()) {
      throw new Error("Đơn vị tính không được để trống.");
    }

    this.id = props.id;
    this.productId = props.productId;
    this.lineNo = props.lineNo;
    this.productNameSnapshot = props.productNameSnapshot;
    this.unitSnapshot = props.unitSnapshot;
    this.docQty = props.docQty;
    this.actualQty = props.actualQty;
    this.unitPrice = props.unitPrice;
    this.debitAccount = props.debitAccount;
    this.creditAccount = props.creditAccount;
    this.note = props.note;
  }

  public calculateAmount(): Money {
    return this.unitPrice.multiply(this.actualQty.value);
  }
}
