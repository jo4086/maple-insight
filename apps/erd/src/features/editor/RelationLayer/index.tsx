import type { ErdEntity, ErdRelation } from '@/features/erd';

import { RelationSourceIcon, RelationTargetIcon } from '../RelationCardinalityIcon';
import { buildRelationPath } from './relationRouting';

const MARKER_LEAD_LENGTH = 1;

const RelationLayer = ({ entities, relations }: { entities: ErdEntity[]; relations: ErdRelation[] }) => {
  const pairCounts = new Map<string, number>();
  const relationOffsets = new Map<string, number>();

  // MEMO: 같은 테이블 쌍 사이에 관계가 여러 개 생기면 lane을 나눠 선이 겹치지 않게 한다.
  relations.forEach((relation) => {
    const pairKey = [relation.fromEntityId, relation.toEntityId].sort().join('::');
    const count = pairCounts.get(pairKey) ?? 0;
    relationOffsets.set(relation.id, count);
    pairCounts.set(pairKey, count + 1);
  });

  return (
    <svg className="pointer-events-none absolute inset-0 z-0 overflow-visible" height="100%" width="100%">
      {relations.map((relation) => {
        const relationColor = relation.relationshipType === 'identifying' ? '#0ea5e9' : '#66ad7a';
        const route = buildRelationPath({
          entities,
          relation,
          offsetIndex: relationOffsets.get(relation.id) ?? 0,
        });

        if (!route) return null;

        const markerStartLead = getLeadPoint(route.startPoint, route.startLeadPoint, MARKER_LEAD_LENGTH);
        const markerEndLead = getLeadPoint(route.endPoint, route.endLeadPoint, MARKER_LEAD_LENGTH);

        return (
          <g key={relation.id}>
            {relation.relationshipType === 'identifying' ? (
              <path d={route.path} fill="none" stroke={relationColor} strokeWidth={2} />
            ) : (
              <>
                <path d={buildSegmentPath([route.startPoint, markerStartLead])} fill="none" stroke={relationColor} strokeWidth={2} />
                <path
                  d={buildSegmentPath([markerStartLead, ...route.points.slice(1, -1), markerEndLead])}
                  fill="none"
                  stroke={relationColor}
                  strokeDasharray="6 5"
                  strokeWidth={2}
                />
                <path d={buildSegmentPath([markerEndLead, route.endPoint])} fill="none" stroke={relationColor} strokeWidth={2} />
              </>
            )}
            {/* MEMO: 선 시작/끝 마커는 첫 번째/마지막 선분 방향에 맞춰 회전시킨다. */}
            <g transform={getStartTransform(route.startPoint, route.startLeadPoint)}>
              <g transform="translate(-20 -15)">
                <RelationSourceIcon color={relationColor} type={relation.fromCardinality} />
              </g>
            </g>
            <g transform={getEndTransform(route.endPoint, route.endLeadPoint)}>
              <g transform="translate(0 -15)">
                <RelationTargetIcon color={relationColor} type={relation.toCardinality} />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

function buildSegmentPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function getAngle(from: { x: number; y: number }, to: { x: number; y: number }) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function getLeadPoint(from: { x: number; y: number }, to: { x: number; y: number }, length: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: from.x + (dx / distance) * length,
    y: from.y + (dy / distance) * length,
  };
}

function getStartTransform(start: { x: number; y: number }, next: { x: number; y: number }) {
  const angle = getAngle(start, next);
  return `translate(${start.x} ${start.y}) rotate(${angle})`;
}

function getEndTransform(end: { x: number; y: number }, prev: { x: number; y: number }) {
  const angle = getAngle(prev, end);
  return `translate(${end.x} ${end.y}) rotate(${angle})`;
}

export default RelationLayer;
