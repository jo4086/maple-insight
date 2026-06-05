import { ClassGroupAttackSkillName } from './skillMeta';

import { skillFormula, type SkillAttackTable } from '@/skill/types';

export const classGroupSkillAttack = {
  '오라 웨폰': [
    {
      type: 'nonAction',
      maxTargets: 10,
      name: '오라 파동',
      damagePercent: skillFormula.level(20, { base: 500 }),
      hitCount: 6,
      intervalSec: 5,
    },
  ],
  '가이디드 애로우': [
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: skillFormula.level(16, { base: 400 }),
      hitCount: 1,
      intervalSec: 1,
    },
  ],
  '베놈 버스트': [
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: skillFormula.level(15, { base: 375 }),
      hitCount: 2,
      durationSec: 30,
      tickIntervalSec: 1,
      canCritical: true,
    },
  ],
} as const satisfies SkillAttackTable<ClassGroupAttackSkillName>;
