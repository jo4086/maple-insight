import type { HeroSkillName } from './skillName';

import { skillFormula, type SkillDurationTable } from '@/skill/types';

export const heroSkillDuration = {
  '스피릿 블레이드': 200,
  '스카링 소드': 200,
  발할라: 30,
  '소드 오브 버닝 소울-일반': skillFormula.floorLevelInterval(6, { base: 15 }),
  '소드 오브 버닝 소울-고정': skillFormula.floorLevelInterval(2, { base: 105 }),
  '콤보 인스팅트': 20,
  '소드 일루전': 8,
  '발할라 VI': 30,
} as const satisfies SkillDurationTable<HeroSkillName>;
