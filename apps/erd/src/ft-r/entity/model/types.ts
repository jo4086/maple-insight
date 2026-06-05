export interface EntityPosition {
  x: number;
  y: number;
}

export interface EntitySize {
  width: number;
  height: number;
}

export interface EntityField {
  _id: string;
  name: string;
  pName: string;
  domain: string;
  type: string;
  defaultValue: string;
  isAllowNull: boolean;
  comment: string;
  relEntityId: string | null;
  relFieldId: string | null;
  relType: import('../../relation/model/types').RelTypes | null;
  relGroupId: string | null;
  isUnique?: boolean;
  enumValues?: string;
}

export interface Entity {
  _id: string;
  position: EntityPosition;
  size: EntitySize;
  name: string;
  pName: string;
  color: string;
  fields: EntityField[];
  keys: {
    pks: EntityField[];
    fks: EntityField[];
  };
}
