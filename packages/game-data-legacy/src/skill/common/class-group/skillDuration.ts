import { type ClassGroupSkillName } from './skillName';

import { type SkillDurationTable, skillFormula } from '@/skill/types';

export const classGroupSkillDuration = {
  '럭키 다이스': 180,
  '오버 드라이브': 28,
  '바디 오브 스틸': skillFormula.floorLevelInterval(10, { base: 15 }),
  '오라 웨폰': skillFormula.level(2, { base: 70 }),
  '레디 투 다이': 15,
  '베놈 버스트': 30,
  '에테리얼 폼': 3,
  '크리티컬 리인포스': 30,
} as const satisfies SkillDurationTable<ClassGroupSkillName>;
