import { GRID_UNIT } from '../shared';
import type { Entity } from '../entity';

const DEFAULT_ENTITY_WIDTH = GRID_UNIT * 100;
const DEFAULT_ENTITY_HEIGHT = GRID_UNIT * 5;
const DEFAULT_ENTITY_COLOR = '#0f172a';
const ENTITY_NAME_PREFIX = 'new_entity';

function snapToGrid(value: number) {
  return Math.round(value / GRID_UNIT) * GRID_UNIT;
}

function getNextEntityName(entities: Entity[]) {
  const existingNames = new Set(entities.map((entity) => entity.name));

  if (!existingNames.has(ENTITY_NAME_PREFIX)) {
    return ENTITY_NAME_PREFIX;
  }

  let suffix = 2;

  while (existingNames.has(`${ENTITY_NAME_PREFIX}${suffix}`)) {
    suffix += 1;
  }

  return `${ENTITY_NAME_PREFIX}${suffix}`;
}

export function createEmptyEntityAt(entities: Entity[], position: { x: number; y: number }): Entity {
  const entityId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `entity_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    _id: entityId,
    color: DEFAULT_ENTITY_COLOR,
    fields: [],
    keys: {
      fks: [],
      pks: [],
    },
    name: getNextEntityName(entities),
    pName: '',
    position: {
      x: snapToGrid(position.x),
      y: snapToGrid(position.y),
    },
    size: {
      height: DEFAULT_ENTITY_HEIGHT,
      width: DEFAULT_ENTITY_WIDTH,
    },
  };
}
