import type { HeroSkillName } from './skillName';

import type { SkillCooldownTable } from '@/skill/types';

export const heroSkillCooldown = {
  발할라: 120,
  '발할라 VI': 120,
  '레이지 업라이징': 10,
  '레이지 업라이징 VI': 10,
  '에픽 어드벤쳐': 120,
  '소드 오브 버닝 소울': 120,
  '콤보 인스팅트': 120,
  '콤보 데스폴트': 25,
  '소드 일루전': 30,
  '스피릿 칼리버': 360,
} as const satisfies SkillCooldownTable<HeroSkillName>;
