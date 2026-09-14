/**
 * 공격 속도를 적용한 스킬 딜레이를 메이플스토리의 30ms 단위로 보정합니다.
 * 실제 계산 흐름에 연결하기 전까지 임시 함수로 보관합니다.
 */
export function calcSkillDelay(delay: number, attackSpeed: number = 2): number {
  return Math.round((delay * (attackSpeed + 10)) / 16 / 30) * 30;
}
