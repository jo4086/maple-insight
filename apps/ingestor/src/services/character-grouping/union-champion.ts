import { UnionChampionResponseRaw } from '@maple/api-union/champion';

import type { AccountMatchResult } from './types';

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike };

function normalizeChampionValue(value: JsonLike): JsonLike {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeChampionValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => key !== 'date')
      .sort()
      .reduce<{ [key: string]: JsonLike }>((accumulator, key) => {
        accumulator[key] = normalizeChampionValue(value[key] as JsonLike);
        return accumulator;
      }, {});
  }

  return value;
}

// INFO: union-champion 응답을 비교 가능한 안정 문자열로 정규화한다.
export function fingerprintUnionChampion(payload: UnionChampionResponseRaw | undefined | null) {
  if (!payload || isUnionChampionEmpty(payload)) {
    return null;
  }

  return JSON.stringify(normalizeChampionValue(payload as unknown as JsonLike));
}

// INFO: union-champion이 비활성 상태인지 확인한다.
export function isUnionChampionEmpty(payload: UnionChampionResponseRaw) {
  return payload.union_champion.length === 0 && payload.champion_badge_total_info.length === 0;
}

/** INFO:
 * union-champion 우선 비교 규칙
 * - 둘 다 값이 있으면 일치 여부만으로 same/different를 확정한다.
 * - 하나라도 null/undefined면 다음 규칙으로 넘기기 위해 unknown을 반환한다.
 **/
export function compareUnionChampion(left: UnionChampionResponseRaw | undefined | null, right: UnionChampionResponseRaw | undefined | null): AccountMatchResult {
  const leftFingerprint = fingerprintUnionChampion(left);
  const rightFingerprint = fingerprintUnionChampion(right);

  if (!leftFingerprint || !rightFingerprint) {
    return {
      decision: 'unknown',
      rule: 'union-champion',
      reason: 'union-champion data is missing on at least one side',
      confidence: 0,
    };
  }

  if (leftFingerprint === rightFingerprint) {
    return {
      decision: 'same',
      rule: 'union-champion',
      reason: 'union-champion payload matches exactly',
      confidence: 1,
    };
  }

  return {
    decision: 'different',
    rule: 'union-champion',
    reason: 'union-champion payload differs',
    confidence: 1,
  };
}
