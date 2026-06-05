import type { ErdEntity } from '@/features/erd';

import { CANVAS_HEIGHT, CANVAS_WIDTH, ENTITY_GAP, GRID_STEP } from './constants';

export type DragState = {
  entityIds: string[];
  anchorEntityId: string;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  startPositions: Record<string, { x: number; y: number }>;
};

export type PanState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

export type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function snapToGrid(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

export function getEntityBounds(entity: ErdEntity): Bounds {
  return {
    left: entity.position.x,
    top: entity.position.y,
    right: entity.position.x + entity.size.width,
    bottom: entity.position.y + entity.size.height,
  };
}

export function intersects(a: Bounds, b: Bounds) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

export function findEmptyPosition(entities: ErdEntity[], width: number, height: number) {
  const occupied = entities.map(getEntityBounds);

  for (let y = 40; y <= CANVAS_HEIGHT - height; y += ENTITY_GAP) {
    for (let x = 40; x <= CANVAS_WIDTH - width; x += ENTITY_GAP) {
      const candidate: Bounds = {
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
      };

      if (occupied.every((bounds) => !intersects(candidate, bounds))) {
        return { x, y };
      }
    }
  }

  return { x: 40, y: 40 };
}
