export const statSourceLabelMap = {
  base: '기본 스탯',
  skill: '스킬',
  equipment: '장비',
  unionOccupation: '유니온 점령 효과',
  unionArtifact: '유니온 아티팩트',
  championInsignia: '챔피언 휘장',
  item: '소비 아이템',
  title: '칭호',
} as const;

export type StatSourceKey = keyof typeof statSourceLabelMap;
export type StatSourceLabel = (typeof statSourceLabelMap)[StatSourceKey];

export const statSourceKeys = Object.keys(statSourceLabelMap) as StatSourceKey[];
export const statSourceLabels = Object.values(statSourceLabelMap) as StatSourceLabel[];

export const afterStatRateSourceLabelMap = {
  unionRaider: '유니온 공격대원 효과',
  hexaStat: '헥사 스탯',
  hyperStat: '하이퍼 스탯',
  arcaneSymbol: '아케인 심볼',
  authenticSymbol: '어센틱 심볼',
  ability: '어빌리티',
} as const;

export type AfterStatRateSourceKey = keyof typeof afterStatRateSourceLabelMap;
export type AfterStatRateSourceLabel = (typeof afterStatRateSourceLabelMap)[AfterStatRateSourceKey];

export const afterStatRateSourceKeys = Object.keys(afterStatRateSourceLabelMap) as AfterStatRateSourceKey[];
export const afterStatRateSourceLabels = Object.values(afterStatRateSourceLabelMap) as AfterStatRateSourceLabel[];

export function isAfterStatRateSource(source: string): source is AfterStatRateSourceKey {
  return afterStatRateSourceKeys.includes(source as AfterStatRateSourceKey);
}
