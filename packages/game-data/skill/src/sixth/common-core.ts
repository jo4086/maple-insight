import { defineSkillLinkedGroups } from '@/types';

export const sixthCommonSkillMap = defineSkillLinkedGroups({
  skills: ['솔 야누스', '솔 헤카테'],
  linkedGroups: [
    {
      source: '솔 야누스',
      linkedSkills: ['솔 야누스 : 황혼', '솔 야누스 : 새벽'],
    },
    {
      source: '솔 헤카테',
      linkedSkills: ['솔 헤카테 : 카론', '솔 헤카테 : 스틱스', '솔 헤카테 : 플레게톤', '솔 헤카테 : 팩텀'],
    },
  ],
});

export const sixthLineageClassGroupSkills = [
  '시그너스 팔랑크스 VI',
  '레지스탕스 라인 인팬트리 VI',
  '콜 마스테마 VI',
  '프리드의 가호 VI',
  '판테온 VI',
  '매직 서킷 풀드라이브 VI',
  '트랜센던트 VI',
  '이계의 잔상 VI',
  '화중군자 VI',
  '블리츠 실드 VI',
  '아르카나 오버라이드 VI',
  '이볼브 VI',
  '얼티밋 다크 사이트 VI',
  '파이렛 플래그 VI',
] as const;

export type SixthLineageClassGroupSkill = (typeof sixthLineageClassGroupSkills)[number];
