import type { LenSkillName } from './skillName';

import type { SkillDurationTable } from '@/skill/types';

export const lenSkillDuration = {
  '장검 가속': 200,
  '망혼검 1초식 : 운기': 4,
  '매화검 4초식 : 영인': 3,
  '아니마 용사의 의지': 3,
  승화: 15,
  '매화검 절기 : 만리향': 30,
  망혼각성: 20,
  '매화검 절기 : 섬무': 5,
} as const satisfies SkillDurationTable<LenSkillName>;
