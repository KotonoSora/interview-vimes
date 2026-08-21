// src/domain/entities/organization.entity.ts
export interface OrganizationProps {
  id?: string;
  code: string;
  name: string;
  department?: string;
}

export class Organization {
  private readonly _id?: string;
  private readonly _code: string;
  private readonly _name: string;
  private readonly _department?: string;

  constructor(props: OrganizationProps) {
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._department = props.department;
  }

  public static create(props: OrganizationProps): Organization {
    return new Organization(props);
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

  public get department(): string | undefined {
    return this._department;
  }

  public toJSON(): OrganizationProps {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      department: this._department,
    };
  }
}
