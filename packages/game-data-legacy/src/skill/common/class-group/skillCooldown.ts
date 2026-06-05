import { ClassGroupSkillName } from './skillName';

import { SkillCooldownTable, skillFormula } from '@/skill/types';

export const classGroupSkillCooldown = {
  '럭키 다이스': 180,
  '레디 투 다이': skillFormula.floorLevelInterval(2, { base: 75 }),
  '바디 오브 스틸': 120,
  '오라 웨폰': 120,
  '에테리얼 폼': skillFormula.floorLevelInterval(2, { base: 75 }),
  '오버 드라이브': skillFormula.floorLevelInterval(3, { base: 70 }),
  '크리티컬 리인포스': 120,
} as const satisfies SkillCooldownTable<ClassGroupSkillName>;
