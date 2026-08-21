// src/domain/entities/goods-receipt.entity.ts
import { Money } from "#/domain/value-objects/money.vo";
import { ReceiptItem } from "#/domain/entities/receipt-item.entity";
import { DomainValidationError } from "#/domain/exceptions/domain.exception";

export type ReceiptType =
  | "PURCHASE"
  | "INTERNAL_PRODUCTION"
  | "OUTSOURCED_PROCESSING"
  | "CAPITAL_CONTRIBUTION"
  | "INVENTORY_SURPLUS";

export type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface GoodsReceiptProps {
  id?: string;
  receiptNumber: string;
  receiptDate: Date;
  actualReceivedDate?: Date;
  organizationId: string;
  warehouseId: string;
  receiptType: ReceiptType;
  description?: string;
  delivererName: string;
  docReference?: string;
  docDate?: Date;
  docOrigin?: string;
  debitAccount?: string;
  creditAccount?: string;
  totalAmountWords?: string;
  attachedDocCount?: string | number;
  creatorName?: string;
  storekeeperName?: string;
  chiefAccountantName?: string;
  status?: ReceiptStatus;
  items: ReceiptItem[];
}

export class GoodsReceipt {
  private readonly _id?: string;
  private readonly _receiptNumber: string;
  private readonly _receiptDate: Date;
  private readonly _actualReceivedDate?: Date;
  private readonly _organizationId: string;
  private readonly _warehouseId: string;
  private readonly _receiptType: ReceiptType;
  private readonly _description?: string;
  private readonly _delivererName: string;
  private readonly _docReference?: string;
  private readonly _docDate?: Date;
  private readonly _docOrigin?: string;
  private readonly _debitAccount?: string;
  private readonly _creditAccount?: string;
  private readonly _totalAmountWords?: string;
  private readonly _attachedDocCount?: string | number;
  private readonly _creatorName?: string;
  private readonly _storekeeperName?: string;
  private readonly _chiefAccountantName?: string;
  private _status: ReceiptStatus;
  private _items: ReceiptItem[];

  constructor(props: GoodsReceiptProps) {
    this.validate(props);

    this._id = props.id;
    this._receiptNumber = props.receiptNumber;
    this._receiptDate = props.receiptDate;
    this._actualReceivedDate = props.actualReceivedDate;
    this._organizationId = props.organizationId;
    this._warehouseId = props.warehouseId;
    this._receiptType = props.receiptType;
    this._description = props.description;
    this._delivererName = props.delivererName;
    this._docReference = props.docReference;
    this._docDate = props.docDate;
    this._docOrigin = props.docOrigin;
    this._debitAccount = props.debitAccount;
    this._creditAccount = props.creditAccount;
    this._totalAmountWords = props.totalAmountWords;
    this._attachedDocCount = props.attachedDocCount;
    this._creatorName = props.creatorName;
    this._storekeeperName = props.storekeeperName;
    this._chiefAccountantName = props.chiefAccountantName;
    this._status = props.status ?? "DRAFT";
    this._items = [...props.items];
  }

  public static create(props: GoodsReceiptProps): GoodsReceipt {
    return new GoodsReceipt(props);
  }

  private validate(props: GoodsReceiptProps): void {
    if (!props.receiptNumber || !props.receiptNumber.trim()) {
      throw new DomainValidationError("Số phiếu không được để trống.");
    }
    if (!props.delivererName || !props.delivererName.trim()) {
      throw new DomainValidationError(
        "Tên người giao hàng không được để trống.",
      );
    }
    if (!props.organizationId || !props.organizationId.trim()) {
      throw new DomainValidationError("Đơn vị lập phiếu không được để trống.");
    }
    if (!props.warehouseId || !props.warehouseId.trim()) {
      throw new DomainValidationError("Kho nhập hàng không được để trống.");
    }
    if (!props.items || props.items.length === 0) {
      throw new DomainValidationError(
        "Phiếu nhập kho phải chứa ít nhất một dòng hàng hóa.",
      );
    }
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get receiptNumber(): string {
    return this._receiptNumber;
  }

  public get receiptDate(): Date {
    return this._receiptDate;
  }

  public get actualReceivedDate(): Date | undefined {
    return this._actualReceivedDate;
  }

  public get organizationId(): string {
    return this._organizationId;
  }

  public get warehouseId(): string {
    return this._warehouseId;
  }

  public get receiptType(): ReceiptType {
    return this._receiptType;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get delivererName(): string {
    return this._delivererName;
  }

  public get docReference(): string | undefined {
    return this._docReference;
  }

  public get docDate(): Date | undefined {
    return this._docDate;
  }

  public get docOrigin(): string | undefined {
    return this._docOrigin;
  }

  public get debitAccount(): string | undefined {
    return this._debitAccount;
  }

  public get creditAccount(): string | undefined {
    return this._creditAccount;
  }

  public get totalAmountWords(): string | undefined {
    return this._totalAmountWords;
  }

  public get attachedDocCount(): string | number | undefined {
    return this._attachedDocCount;
  }

  public get creatorName(): string | undefined {
    return this._creatorName;
  }

  public get storekeeperName(): string | undefined {
    return this._storekeeperName;
  }

  public get chiefAccountantName(): string | undefined {
    return this._chiefAccountantName;
  }

  public get status(): ReceiptStatus {
    return this._status;
  }

  public get items(): ReceiptItem[] {
    return [...this._items];
  }

  public calculateTotalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.calculateAmount()),
      new Money(0),
    );
  }

  public confirm(): void {
    if (this._status === "CANCELLED") {
      throw new DomainValidationError("Không thể duyệt phiếu đã bị hủy.");
    }
    this._status = "CONFIRMED";
  }

  public cancel(): void {
    if (this._status === "CANCELLED") {
      throw new DomainValidationError(
        "Phiếu này đã ở trạng thái hủy trước đó.",
      );
    }
    this._status = "CANCELLED";
  }

  public toProps(): GoodsReceiptProps {
    return {
      id: this._id,
      receiptNumber: this._receiptNumber,
      receiptDate: this._receiptDate,
      actualReceivedDate: this._actualReceivedDate,
      organizationId: this._organizationId,
      warehouseId: this._warehouseId,
      receiptType: this._receiptType,
      description: this._description,
      delivererName: this._delivererName,
      docReference: this._docReference,
      docDate: this._docDate,
      docOrigin: this._docOrigin,
      debitAccount: this._debitAccount,
      creditAccount: this._creditAccount,
      totalAmountWords: this._totalAmountWords,
      attachedDocCount: this._attachedDocCount,
      creatorName: this._creatorName,
      storekeeperName: this._storekeeperName,
      chiefAccountantName: this._chiefAccountantName,
      status: this._status,
      items: [...this._items],
    };
  }
}
