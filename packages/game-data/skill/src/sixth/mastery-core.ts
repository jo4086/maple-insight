import type { FinalClassNameKey } from '@maple/data-class';

import { SkillLinkedGroups } from '@/types';

export const sixthClassMasteryCoreMap = {
  hero: {
    skills: ['레이징 블로우 VI', '레이지 업라이징 VI', '오라 블레이드 VI', '퓨리어스 엣지', '발할라 VI', '인사이징 VI', '파이널 어택 VI', '파이널 블레이드'],
    linkedGroups: [
      {
        source: '오라 블레이드 VI',
        linkedSkills: ['퓨리어스 엣지'],
      },
      {
        source: '발할라 VI',
        linkedSkills: ['발할라 VI', '인사이징 VI', '파이널 어택 VI'],
      },
    ],
    derivedSkills: [
      {
        source: '오라 블레이드 VI',
        skills: ['파이널 블레이드'],
      },
    ],
  },
} as const satisfies Partial<Record<FinalClassNameKey, SkillLinkedGroups>>;
