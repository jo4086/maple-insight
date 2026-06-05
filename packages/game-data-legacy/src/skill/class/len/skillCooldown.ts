import type { LenSkillName } from './skillName';

import type { SkillCooldownTable } from '@/skill/types';

export const lenSkillCooldown = {
  '망혼검 1초식 : 운기': 6,
  망혼강림: 20,
  오도: 1,
  '매화검 3초식 : 일격예인': 30,
  '매화검 4초식 : 영인': 70,
  '아니마 용사의 의지': 300,
  '매화검 5초식 : 천매지박': 120,
  승화: 120,
  '매화검 절기 : 만리향': 120,
  망혼각성: 120,
  '매화검 절기 : 섬무': 120,
  '매화검 3초식 : 일격예인 VI': 30,
  '창룡파천검 : 승천': 360,
  '망혼강림 VI': 20,
} as const satisfies SkillCooldownTable<LenSkillName>;
