// src/domain/entities/warehouse.entity.ts
export interface WarehouseProps {
  id?: string;
  organizationId: string;
  code: string;
  name: string;
  location?: string;
  isActive?: boolean;
}

export class Warehouse {
  private readonly _id?: string;
  private readonly _organizationId: string;
  private readonly _code: string;
  private readonly _name: string;
  private readonly _location?: string;
  private readonly _isActive: boolean;

  constructor(props: WarehouseProps) {
    this._id = props.id;
    this._organizationId = props.organizationId;
    this._code = props.code;
    this._name = props.name;
    this._location = props.location;
    this._isActive = props.isActive ?? true;
  }

  public static create(props: WarehouseProps): Warehouse {
    return new Warehouse(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get organizationId(): string {
    return this._organizationId;
  }
  public get code(): string {
    return this._code;
  }
  public get name(): string {
    return this._name;
  }
  public get location(): string | undefined {
    return this._location;
  }
  public get isActive(): boolean {
    return this._isActive;
  }

  public toJSON() {
    return {
      id: this._id,
      organizationId: this._organizationId,
      code: this._code,
      name: this._name,
      location: this._location,
      isActive: this._isActive,
    };
  }
}
