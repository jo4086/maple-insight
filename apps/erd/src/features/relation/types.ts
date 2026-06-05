export type RelationCardinality = 'one' | 'one_only' | 'zero_or_one' | 'many' | 'zero_or_many' | 'one_or_many' | 'zero_or_one_or_many';

export interface TableField {
  _id: string;
  name: string;
  pName: string;
  type: string;
  defaultValue: string;
  isAllowNull: boolean;
  comment: string;
  relEntityId: string | null;
  relFieldId: string | null;
  relType: RelationCardinality | null;
  relGroupId: string | null;
}

export interface TableEntity {
  _id: string;
  position: {
    x: number;
    y: number;
  };
  name: string;
  pName: string;
  color: string;
  fields: TableField[];
  keys: {
    pks: TableField[];
    fks: TableField[];
  };
}
