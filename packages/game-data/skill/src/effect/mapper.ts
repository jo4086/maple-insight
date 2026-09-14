import type { SkillEffectKey } from './definition';

export const skillNameEffectKeyMap = {
  '메이플 용사': 'mapleHero',
  '시그너스 나이츠': 'mapleHero',
  '노바의 용사': 'mapleHero',
  '레프의 용사': 'mapleHero',
  '아니마의 용사': 'mapleHero',
  '이계의 용사': 'mapleHero',
  '마스테리아의 용사': 'mapleHero',
  '륀느의 가호': 'mapleHero',
  '파이렛 플래그': 'pirateFlag',
  '파이렛 플래그 VI': 'pirateFlagVI',
  '파이렛 플래그VI': 'pirateFlagVI',
  '이계의 잔상': 'otherworldlyAfterimage',
  '이계의 잔상 VI': 'otherworldlyAfterimageVI',
  '이계의 잔상VI': 'otherworldlyAfterimageVI',
  '메이플월드 여신의 축복': 'mapleWorldGoddessBlessing',
} as const satisfies Record<string, SkillEffectKey>;
