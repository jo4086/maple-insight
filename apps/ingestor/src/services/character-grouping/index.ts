import type { UnionChampionResponseRaw } from '@maple/api-union/champion';
import type { UnionRaiderResponseRaw } from '@maple/api-union/raider';

import type { AccountMatchResult } from './types';
import { compareUnionChampion } from './union-champion';
import { compareUnionRaider } from './union-raider';

type CompareCharacterAccountInput = {
  leftUnionChampion?: UnionChampionResponseRaw | null;
  rightUnionChampion?: UnionChampionResponseRaw | null;
  leftUnionRaider?: UnionRaiderResponseRaw | null;
  rightUnionRaider?: UnionRaiderResponseRaw | null;
};

/** INFO:
 * 계정 동일성 최종 판정 진입점
 * - 1차로 union-champion을 비교한다.
 * - champion 데이터가 없을 때만 union-raider 5개 preset 비교로 내려간다.
 **/
export function compareCharacterAccount(input: CompareCharacterAccountInput): AccountMatchResult {
  const championResult = compareUnionChampion(input.leftUnionChampion, input.rightUnionChampion);

  if (championResult.decision !== 'unknown') {
    return championResult;
  }

  return compareUnionRaider(input.leftUnionRaider, input.rightUnionRaider);
}

export type { AccountMatchDecision, AccountMatchResult, AccountMatchRule } from './types';
