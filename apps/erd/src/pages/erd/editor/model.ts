import type { ErdColumn, ErdDocument, ErdEntity } from '@/features/erd';

import { ENTITY_DEFAULT_HEIGHT, ENTITY_DEFAULT_WIDTH } from './constants';

export function createEntity(index = 0): ErdEntity {
  return {
    id: crypto.randomUUID(),
    name: 'new_table',
    comment: '',
    color: '#0f172a',
    isUniqueColumnVisible: false,
    position: {
      x: 40 + (index % 4) * 420,
      y: 40 + Math.floor(index / 4) * 280,
    },
    size: {
      width: ENTITY_DEFAULT_WIDTH,
      height: ENTITY_DEFAULT_HEIGHT,
    },
    columns: [
      {
        id: crypto.randomUUID(),
        keyType: null,
        relationKeyType: null,
        referencedEntityId: null,
        referencedColumnId: null,
        referencedRelationId: null,
        name: 'name',
        pName: 'name',
        domain: '',
        type: '',
        enumValues: '',
        isAllowNull: true,
        isUnique: false,
        defaultValue: '',
        comment: '',
      },
    ],
  };
}

export function createColumn(name = 'name', keyType: ErdColumn['keyType'] = null): ErdColumn {
  return {
    id: crypto.randomUUID(),
    keyType,
    relationKeyType: null,
    referencedEntityId: null,
    referencedColumnId: null,
    referencedRelationId: null,
    name,
    pName: name,
    domain: '',
    type: '',
    enumValues: '',
    isAllowNull: true,
    isUnique: false,
    defaultValue: '',
    comment: '',
  };
}

export function createIncrementedColumnName(columns: ErdColumn[], baseName: string) {
  const names = new Set(columns.map((column) => column.name.trim().toLowerCase()));

  if (!names.has(baseName.toLowerCase())) {
    return baseName;
  }

  let index = 2;
  while (names.has(`${baseName}${index}`.toLowerCase())) {
    index += 1;
  }

  return `${baseName}${index}`;
}

export function getColumnPriority(column: ErdColumn) {
  if (column.keyType === 'pk') return 0;
  if (column.keyType === 'fk' && column.relationKeyType === 'identifying') return 1;
  if (column.keyType === 'fk') return 2;
  return 3;
}

export function sortColumnsByPriority(columns: ErdColumn[]) {
  return columns
    .map((column, index) => ({ column, index }))
    .sort((a, b) => {
      const priorityDiff = getColumnPriority(a.column) - getColumnPriority(b.column);
      if (priorityDiff !== 0) return priorityDiff;
      return a.index - b.index;
    })
    .map(({ column }) => column);
}

export function canAutoSaveDocument(document: ErdDocument) {
  return document.entities.length > 0 || (document.title.trim() !== '' && document.title !== 'Untitled ERD');
}
