import type { UnionRaiderResponseRaw, UnionRaiderPresetRaw } from '@maple/api-union/raider';

import type { AccountMatchResult } from './types';

function sortStringArray(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function normalizeBlockPosition(positions: { x: number; y: number }[]) {
  return [...positions].sort((left, right) => {
    if (left.x !== right.x) return left.x - right.x;
    return left.y - right.y;
  });
}

// INFO: union-raider preset을 순서 영향 없이 비교할 수 있도록 정규화한다.
export function normalizeUnionRaiderBase(base: UnionRaiderPresetRaw) {
  return {
    union_raider_stat: sortStringArray(base.union_raider_stat),
    union_occupied_stat: sortStringArray(base.union_occupied_stat),
    union_inner_stat: [...base.union_inner_stat].sort((left, right) => {
      const leftKey = `${left.stat_field_id}:${left.stat_field_effect}`;
      const rightKey = `${right.stat_field_id}:${right.stat_field_effect}`;
      return leftKey.localeCompare(rightKey);
    }),
    union_block: [...base.union_block]
      .map((block) => ({
        block_type: block.block_type,
        block_class: block.block_class,
        block_level: block.block_level,
        block_control_point: {
          x: block.block_control_point.x,
          y: block.block_control_point.y,
        },
        block_position: normalizeBlockPosition(block.block_position),
      }))
      .sort((left, right) => {
        const leftKey = `${left.block_type}:${left.block_class}:${left.block_level}:${left.block_control_point.x}:${left.block_control_point.y}:${JSON.stringify(left.block_position)}`;
        const rightKey = `${right.block_type}:${right.block_class}:${right.block_level}:${right.block_control_point.x}:${right.block_control_point.y}:${JSON.stringify(right.block_position)}`;
        return leftKey.localeCompare(rightKey);
      }),
  };
}

// INFO: union-raider preset 하나를 비교용 fingerprint로 변환한다.
export function fingerprintUnionRaiderBase(base: UnionRaiderPresetRaw) {
  return JSON.stringify(normalizeUnionRaiderBase(base));
}

// INFO: union-raider가 비활성 상태인지 확인한다.
export function isUnionRaiderEmpty(payload: UnionRaiderResponseRaw) {
  return (
    payload.union_raider_preset_1 === null &&
    payload.union_raider_preset_2 === null &&
    payload.union_raider_preset_3 === null &&
    payload.union_raider_preset_4 === null &&
    payload.union_raider_preset_5 === null
  );
}

function getPresetFingerprints(payload: UnionRaiderResponseRaw) {
  if (isUnionRaiderEmpty(payload)) {
    return null;
  }

  return [
    payload.union_raider_preset_1 ? fingerprintUnionRaiderBase(payload.union_raider_preset_1) : null,
    payload.union_raider_preset_2 ? fingerprintUnionRaiderBase(payload.union_raider_preset_2) : null,
    payload.union_raider_preset_3 ? fingerprintUnionRaiderBase(payload.union_raider_preset_3) : null,
    payload.union_raider_preset_4 ? fingerprintUnionRaiderBase(payload.union_raider_preset_4) : null,
    payload.union_raider_preset_5 ? fingerprintUnionRaiderBase(payload.union_raider_preset_5) : null,
  ];
}

/** INFO:
 * union-raider 5개 preset 비교 규칙
 * - preset 1~5가 모두 일치하면 same으로 확정한다.
 * - 하나라도 다르면 different로 본다.
 * - 둘 중 하나라도 값이 없으면 unknown을 반환한다.
 **/
export function compareUnionRaider(left: UnionRaiderResponseRaw | undefined | null, right: UnionRaiderResponseRaw | undefined | null): AccountMatchResult {
  if (!left || !right) {
    return {
      decision: 'unknown',
      rule: 'union-raider',
      reason: 'union-raider data is missing on at least one side',
      confidence: 0,
    };
  }

  const leftFingerprints = getPresetFingerprints(left);
  const rightFingerprints = getPresetFingerprints(right);

  if (!leftFingerprints || !rightFingerprints) {
    return {
      decision: 'unknown',
      rule: 'union-raider',
      reason: 'union-raider preset data is missing on at least one side',
      confidence: 0,
    };
  }

  const mismatchedPresetIndexes = leftFingerprints
    .map((fingerprint, index) => (fingerprint === rightFingerprints[index] ? null : index + 1))
    .filter((value): value is number => value !== null);

  if (mismatchedPresetIndexes.length === 0) {
    return {
      decision: 'same',
      rule: 'union-raider',
      reason: 'all union-raider presets match',
      confidence: 0.95,
    };
  }

  return {
    decision: 'different',
    rule: 'union-raider',
    reason: `union-raider preset mismatch on ${mismatchedPresetIndexes.join(', ')}`,
    confidence: 0.9,
  };
}
