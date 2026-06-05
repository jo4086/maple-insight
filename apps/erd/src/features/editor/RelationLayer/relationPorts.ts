import type { ErdEntity } from '@/features/erd';
import { GRID_STEP } from '@/pages/erd/editor/constants';

import type { Point } from './relationRouting';

export type Rect = { left: number; right: number; top: number; bottom: number };
export type RelationPortSide = 'top' | 'bottom' | 'left' | 'right';
export type RelationPort = {
  anchor: Point;
  id: string;
  lead: Point;
  side: RelationPortSide;
};

const PORT_SPACING = 12;
const RELATION_LEAD_LENGTH = GRID_STEP * 2;
const PORT_OUTSET = 1;

export function snapToStep(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

export function snapToPortStep(value: number) {
  return Math.round(value / PORT_SPACING) * PORT_SPACING;
}

export function clampWithin(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function toRect(entity: ErdEntity): Rect {
  return {
    left: entity.position.x,
    right: entity.position.x + entity.size.width,
    top: entity.position.y,
    bottom: entity.position.y + entity.size.height,
  };
}

export function inflateRect(rect: Rect, amount: number): Rect {
  return {
    left: rect.left - amount,
    right: rect.right + amount,
    top: rect.top - amount,
    bottom: rect.bottom + amount,
  };
}

export function buildEntityPorts(entity: ErdEntity, laneOffset = 0) {
  const rect = toRect(entity);
  const ports: RelationPort[] = [];
  const topBottomXs = buildEdgePositions(rect.left, rect.right, entity.position.x + entity.size.width / 2 + laneOffset);
  const leftRightYs = buildEdgePositions(rect.top, rect.bottom, entity.position.y + entity.size.height / 2 + laneOffset);

  // MEMO: 탑/바텀/레프트/라이트 각 변에 일정 간격으로 port 후보를 만든다.
  topBottomXs.forEach((x, index) => {
    ports.push({
      id: `${entity.id}:top:${index}`,
      side: 'top',
      anchor: { x, y: rect.top - PORT_OUTSET },
      lead: { x, y: rect.top - PORT_OUTSET - RELATION_LEAD_LENGTH },
    });
    ports.push({
      id: `${entity.id}:bottom:${index}`,
      side: 'bottom',
      anchor: { x, y: rect.bottom + PORT_OUTSET },
      lead: { x, y: rect.bottom + PORT_OUTSET + RELATION_LEAD_LENGTH },
    });
  });

  leftRightYs.forEach((y, index) => {
    ports.push({
      id: `${entity.id}:left:${index}`,
      side: 'left',
      anchor: { x: rect.left - PORT_OUTSET, y },
      lead: { x: rect.left - PORT_OUTSET - RELATION_LEAD_LENGTH, y },
    });
    ports.push({
      id: `${entity.id}:right:${index}`,
      side: 'right',
      anchor: { x: rect.right + PORT_OUTSET, y },
      lead: { x: rect.right + PORT_OUTSET + RELATION_LEAD_LENGTH, y },
    });
  });

  return ports;
}

export function chooseBestPort({
  entity,
  laneOffset = 0,
  obstacles,
  occupiedPortIds,
  targetPoint,
}: {
  entity: ErdEntity;
  laneOffset?: number;
  obstacles: Rect[];
  occupiedPortIds?: Set<string>;
  targetPoint: Point;
}) {
  const ports = buildEntityPorts(entity, laneOffset);
  const availablePorts = ports.filter((port) => isLeadClear(port, obstacles) && !(occupiedPortIds?.has(port.id) ?? false));
  const candidates = availablePorts.length > 0 ? availablePorts : ports;

  return candidates.reduce((best, port) => {
    if (!best) return port;
    return getPortScore(port, targetPoint) < getPortScore(best, targetPoint) ? port : best;
  }, candidates[0]);
}

export function chooseBestPortPair({
  fromEntity,
  fromLaneOffset = 0,
  obstacles,
  toEntity,
  toLaneOffset = 0,
}: {
  fromEntity: ErdEntity;
  fromLaneOffset?: number;
  obstacles: Rect[];
  toEntity: ErdEntity;
  toLaneOffset?: number;
}) {
  const fromPorts = buildEntityPorts(fromEntity, fromLaneOffset);
  const toPorts = buildEntityPorts(toEntity, toLaneOffset);
  const fromCandidates = fromPorts.filter((port) => isLeadClear(port, obstacles));
  const toCandidates = toPorts.filter((port) => isLeadClear(port, obstacles));
  const usableFrom = fromCandidates.length > 0 ? fromCandidates : fromPorts;
  const usableTo = toCandidates.length > 0 ? toCandidates : toPorts;

  let bestPair = {
    from: usableFrom[0]!,
    to: usableTo[0]!,
    score: Number.POSITIVE_INFINITY,
  };

  usableFrom.forEach((fromPort) => {
    usableTo.forEach((toPort) => {
      const score = getPortPairScore(fromPort, toPort);
      if (score < bestPair.score) {
        bestPair = { from: fromPort, to: toPort, score };
      }
    });
  });

  return { from: bestPair.from, to: bestPair.to };
}

function buildEdgePositions(min: number, max: number, preferred: number) {
  const positions: number[] = [];
  const start = snapToPortStep(min + PORT_SPACING);
  const end = snapToPortStep(max - PORT_SPACING);

  for (let value = start; value <= end; value += PORT_SPACING) {
    positions.push(value);
  }

  if (positions.length === 0) {
    return [snapToPortStep((min + max) / 2)];
  }

  const preferredSnapped = snapToPortStep(clampWithin(preferred, positions[0], positions[positions.length - 1]));
  if (!positions.includes(preferredSnapped)) positions.push(preferredSnapped);

  return [...new Set(positions)].sort((a, b) => a - b);
}

function isLeadClear(port: RelationPort, obstacles: Rect[]) {
  const leadRect = normalizeRect(port.anchor, port.lead);
  return !obstacles.some((rect) => intersects(leadRect, rect));
}

function normalizeRect(a: Point, b: Point): Rect {
  return {
    left: Math.min(a.x, b.x),
    right: Math.max(a.x, b.x),
    top: Math.min(a.y, b.y),
    bottom: Math.max(a.y, b.y),
  };
}

function intersects(a: Rect, b: Rect) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function getPortScore(port: RelationPort, targetPoint: Point) {
  const distance = Math.abs(port.lead.x - targetPoint.x) + Math.abs(port.lead.y - targetPoint.y);
  const sideBias =
    port.side === 'right' && targetPoint.x >= port.anchor.x ? -GRID_STEP :
    port.side === 'left' && targetPoint.x <= port.anchor.x ? -GRID_STEP :
    port.side === 'bottom' && targetPoint.y >= port.anchor.y ? -GRID_STEP :
    port.side === 'top' && targetPoint.y <= port.anchor.y ? -GRID_STEP :
    0;

  return distance + sideBias;
}

function getPortPairScore(fromPort: RelationPort, toPort: RelationPort) {
  const leadDistance = Math.abs(fromPort.lead.x - toPort.lead.x) + Math.abs(fromPort.lead.y - toPort.lead.y);
  const oppositeBonus = areOppositeSides(fromPort.side, toPort.side) ? -GRID_STEP * 3 : 0;
  const sameAxisBonus =
    (isHorizontal(fromPort.side) && isHorizontal(toPort.side) && Math.abs(fromPort.anchor.y - toPort.anchor.y) <= GRID_STEP) ||
    (isVertical(fromPort.side) && isVertical(toPort.side) && Math.abs(fromPort.anchor.x - toPort.anchor.x) <= GRID_STEP)
      ? -GRID_STEP * 2
      : 0;
  const awkwardPenalty =
    isHorizontal(fromPort.side) && isVertical(toPort.side) ? GRID_STEP :
    isVertical(fromPort.side) && isHorizontal(toPort.side) ? GRID_STEP :
    0;

  return leadDistance + oppositeBonus + sameAxisBonus + awkwardPenalty;
}

function areOppositeSides(a: RelationPortSide, b: RelationPortSide) {
  return (
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left') ||
    (a === 'top' && b === 'bottom') ||
    (a === 'bottom' && b === 'top')
  );
}

function isHorizontal(side: RelationPortSide) {
  return side === 'left' || side === 'right';
}

function isVertical(side: RelationPortSide) {
  return side === 'top' || side === 'bottom';
}
