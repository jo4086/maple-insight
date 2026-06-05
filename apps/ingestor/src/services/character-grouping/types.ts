export type AccountMatchDecision = 'same' | 'different' | 'unknown';

export type AccountMatchRule = 'union-champion' | 'union-raider' | 'none';

/** INFO:
 * 캐릭터 계정 동일성 판정 결과다.
 * - decision은 same/different/unknown 셋 중 하나다.
 * - rule은 어떤 규칙이 최종 판정에 사용됐는지 나타낸다.
 **/
export type AccountMatchResult = {
  decision: AccountMatchDecision;
  rule: AccountMatchRule;
  reason: string;
  confidence: number;
};
