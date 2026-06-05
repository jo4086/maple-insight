import type { SkillRawJobCategory } from '@/types';

/**
 * 스킬 코어/헥사 계열 원본 jobID 분류.
 *
 * 실제 직업 전직 jobID가 아니라 공용 코어, 직업군 코어, 6차 공용/특수 강화,
 * 헥사스탯처럼 별도 raw jobID에 담긴 스킬 묶음을 식별하기 위한 규칙이다.
 */
export const skillRawJobCategoryMap = {
  '40000': {
    kind: 'fifthSkillCore',
    scope: 'all',
    desc: '공용 5차 스킬 코어, 소속군 5차 스킬 코어, 전직업 강화 코어',
  },
  '40001': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '전사',
    desc: '전사 공용 5차 스킬 코어와 전사 직업 전용 5차 스킬 코어',
  },
  '40002': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '마법사',
    desc: '마법사 공용 5차 스킬 코어와 마법사 직업 전용 5차 스킬 코어',
  },
  '40003': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '궁수',
    desc: '궁수 공용 5차 스킬 코어와 궁수 직업 전용 5차 스킬 코어',
  },
  '40004': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '도적',
    desc: '도적 공용 5차 스킬 코어와 도적 직업 전용 5차 스킬 코어',
  },
  '40005': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '해적',
    desc: '해적 공용 5차 스킬 코어와 해적 직업 전용 5차 스킬 코어',
  },
  '50000': {
    kind: 'sixthCore',
    scope: 'all',
    desc: '6차 공용 코어와 전직업 6차 강화 코어',
  },
  '50006': {
    kind: 'sixthSpecialEnhancementCore',
    scope: 'all',
    desc: '전직업 6차 강화 코어 중 단순 최종 데미지 증가가 아닌 특수 규칙 코어',
  },
  '50007': {
    kind: 'hexaStat',
    scope: 'all',
    desc: '헥사스탯',
  },
} as const satisfies Record<string, SkillRawJobCategory>;

export type SkillRawJobCategoryId = keyof typeof skillRawJobCategoryMap;

export function getSkillRawJobCategory(jobID: string): SkillRawJobCategory | undefined {
  return skillRawJobCategoryMap[jobID as SkillRawJobCategoryId];
}
