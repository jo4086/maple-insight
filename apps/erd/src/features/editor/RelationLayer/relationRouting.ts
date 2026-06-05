import type { ErdEntity, ErdRelation } from '@/features/erd';
import { GRID_STEP } from '@/pages/erd/editor/constants';
import { chooseBestPortPair, inflateRect, snapToStep, toRect, type Rect } from './relationPorts';

export type Point = { x: number; y: number };

export function buildRelationPath({
  entities,
  relation,
  offsetIndex,
}: {
  entities: ErdEntity[];
  relation: ErdRelation;
  offsetIndex: number;
}) {
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
  const fromEntity = entityMap.get(relation.fromEntityId);
  const toEntity = entityMap.get(relation.toEntityId);

  if (!fromEntity || !toEntity) return null;

  // MEMO: 먼저 각 테이블의 중심 좌표를 구한 뒤,
  // MEMO: 상대 테이블을 바라보는 방향의 border 지점을 시작/도착 anchor로 잡는다.
  const fromCenterX = fromEntity.position.x + fromEntity.size.width / 2;
  const fromCenterY = fromEntity.position.y + fromEntity.size.height / 2;
  const toCenterX = toEntity.position.x + toEntity.size.width / 2;
  const toCenterY = toEntity.position.y + toEntity.size.height / 2;
  const deltaX = toCenterX - fromCenterX;
  const deltaY = toCenterY - fromCenterY;
  const pairOffset = offsetIndex * 18;
  const sideBias = offsetIndex % 2 === 0 ? 1 : -1;

  // MEMO: 시작/도착 테이블을 제외한 다른 테이블들은 장애물로 취급해서
  // MEMO: 선이 그리드 위에서 자동으로 우회하도록 한다.
  const obstacleRects = entities
    .filter((entity) => entity.id !== fromEntity.id && entity.id !== toEntity.id)
    .map((entity) => inflateRect(toRect(entity), GRID_STEP));
  const { from: startAnchor, to: endAnchor } = chooseBestPortPair({
    fromEntity,
    fromLaneOffset: pairOffset * sideBias,
    obstacles: obstacleRects,
    toEntity,
    toLaneOffset: pairOffset * sideBias,
  });
  const routedPoints = routePolyline(startAnchor.lead, endAnchor.lead, obstacleRects);

  // MEMO: 최종 선 점 목록은
  // MEMO: border anchor에서 마커 방향으로 최소 길이를 먼저 발출한 뒤에만 꺾일 수 있게 한다.
  const points = simplifyPolyline([startAnchor.anchor, startAnchor.lead, ...routedPoints, endAnchor.lead, endAnchor.anchor]);

  return {
    endLeadPoint: points[points.length - 2] ?? points[points.length - 1],
    points,
    path: buildPolylinePath(points),
    startLeadPoint: points[1] ?? points[0],
    startAngle: getSegmentAngle(points[0], points[1] ?? points[0]),
    endAngle: getSegmentAngle(points[points.length - 1] ?? points[0], points[points.length - 2] ?? points[0]) + 180,
    startPoint: points[0],
    endPoint: points[points.length - 1],
  };
}

function buildPolylinePath(points: Point[]) {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function simplifyPolyline(points: Point[]) {
  const deduped = points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y);
  const simplified: Point[] = [];

  deduped.forEach((point) => {
    if (simplified.length < 2) {
      simplified.push(point);
      return;
    }

    const a = simplified[simplified.length - 2];
    const b = simplified[simplified.length - 1];
    const isCollinear = (a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y);

    if (isCollinear) {
      simplified[simplified.length - 1] = point;
      return;
    }

    simplified.push(point);
  });

  return simplified;
}

function getSegmentAngle(from: Point, to: Point) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function routePolyline(start: Point, end: Point, obstacles: Rect[]) {
  // MEMO: A*를 에디터 그리드 위에서 돌려서 선이 직각 위주로 안정적으로 우회하게 만든다.
  const paddedBounds = {
    left: snapToStep(Math.min(start.x, end.x, ...obstacles.map((rect) => rect.left)) - GRID_STEP * 4),
    right: snapToStep(Math.max(start.x, end.x, ...obstacles.map((rect) => rect.right)) + GRID_STEP * 4),
    top: snapToStep(Math.min(start.y, end.y, ...obstacles.map((rect) => rect.top)) - GRID_STEP * 4),
    bottom: snapToStep(Math.max(start.y, end.y, ...obstacles.map((rect) => rect.bottom)) + GRID_STEP * 4),
  };

  const startNode = { x: snapToStep(start.x), y: snapToStep(start.y) };
  const endNode = { x: snapToStep(end.x), y: snapToStep(end.y) };
  const startKey = `${startNode.x},${startNode.y}`;
  const endKey = `${endNode.x},${endNode.y}`;
  const open = new Set<string>([startKey]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([[startKey, manhattan(startNode, endNode)]]);

  while (open.size > 0) {
    const currentKey = [...open].reduce((best, key) => ((fScore.get(key) ?? Infinity) < (fScore.get(best) ?? Infinity) ? key : best));
    const current = parseKey(currentKey);

    if (currentKey === endKey) {
      return reconstructPath(cameFrom, currentKey).map(parseKey);
    }

    open.delete(currentKey);

    for (const neighbor of getNeighbors(current, paddedBounds)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (isBlocked(neighbor, obstacles) && neighborKey !== endKey) continue;

      const tentative = (gScore.get(currentKey) ?? Infinity) + GRID_STEP;

      if (tentative >= (gScore.get(neighborKey) ?? Infinity)) continue;

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentative);
      fScore.set(neighborKey, tentative + manhattan(neighbor, endNode));
      open.add(neighborKey);
    }
  }

  // MEMO: 장애물을 피하는 경로를 못 찾으면 최소한의 꺾임 경로로 fallback 한다.
  const midX = snapToStep((start.x + end.x) / 2);
  return [
    { x: midX, y: start.y },
    { x: midX, y: end.y },
  ];
}

function getNeighbors(point: Point, bounds: Rect) {
  const candidates = [
    { x: point.x + GRID_STEP, y: point.y },
    { x: point.x - GRID_STEP, y: point.y },
    { x: point.x, y: point.y + GRID_STEP },
    { x: point.x, y: point.y - GRID_STEP },
  ];

  return candidates.filter((candidate) => candidate.x >= bounds.left && candidate.x <= bounds.right && candidate.y >= bounds.top && candidate.y <= bounds.bottom);
}

function isBlocked(point: Point, obstacles: Rect[]) {
  return obstacles.some((rect) => point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom);
}

function reconstructPath(cameFrom: Map<string, string>, currentKey: string) {
  const path = [currentKey];
  let cursor = currentKey;

  while (cameFrom.has(cursor)) {
    cursor = cameFrom.get(cursor)!;
    path.unshift(cursor);
  }

  return path;
}

function parseKey(key: string): Point {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function manhattan(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
