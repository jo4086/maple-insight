import type { FinalClassNameKey } from '@maple/data-class';

import type { SkillLinkedGroups } from '@/types';

export type SixthClassEnhancementMap = Partial<Record<FinalClassNameKey, SkillLinkedGroups>>;

export const sixthClassEnhancementOverrides = {
  pathfinder: {
    skills: ['얼티밋 블래스트 강화', '에인션트 템페스트/프라이멀 템페스트 강화', '옵시디언 배리어 강화', '렐릭 언바운드 강화'],
  },
  'night-walker': {
    skills: ['쉐도우 스피어 강화', '쉐도우 서번트 익스텐드/쉐도우 쉬프트 강화', '쉐도우 바이트 강화', '래피드 스로우 강화'],
  },
} as const satisfies SixthClassEnhancementMap;
