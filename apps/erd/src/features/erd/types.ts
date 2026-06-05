export type ErdColumn = {
  id: string;
  keyType: 'pk' | 'fk' | null;
  relationKeyType: 'identifying' | 'non-identifying' | null;
  referencedEntityId: string | null;
  referencedColumnId: string | null;
  referencedRelationId: string | null;
  name: string;
  pName: string;
  domain: string;
  type: string;
  enumValues: string;
  isAllowNull: boolean;
  isUnique: boolean;
  defaultValue: string;
  comment: string;
};

export type ErdEntityPosition = {
  x: number;
  y: number;
};

export type ErdEntitySize = {
  width: number;
  height: number;
};

export type ErdEntity = {
  id: string;
  name: string;
  comment: string;
  color: string;
  isUniqueColumnVisible: boolean;
  position: ErdEntityPosition;
  size: ErdEntitySize;
  columns: ErdColumn[];
};

export type ErdMemo = {
  id: string;
  title: string;
  content: string;
};

export type ErdRelationCardinality = 'one' | 'one-only' | 'zero-or-one' | 'many' | 'zero-or-many' | 'one-or-many' | 'zero-or-one-or-many';

export type ErdRelation = {
  id: string;
  fromEntityId: string;
  fromColumnId: string | null;
  toEntityId: string;
  toColumnId: string | null;
  fromCardinality: ErdRelationCardinality;
  toCardinality: ErdRelationCardinality;
  relationshipType: 'identifying' | 'non-identifying';
};

export type ErdDocument = {
  id: string;
  thumbnail: string | null;
  title: string;
  updatedAt: string;
  entities: ErdEntity[];
  memos: ErdMemo[];
  relations: ErdRelation[];
};
