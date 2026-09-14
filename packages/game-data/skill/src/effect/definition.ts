export const skillEffectKeys = ['mapleHero', 'pirateFlag', 'pirateFlagVI', 'otherworldlyAfterimage', 'otherworldlyAfterimageVI', 'mapleWorldGoddessBlessing'] as const;
export type SkillEffectKey = (typeof skillEffectKeys)[number];

export const skillEffectCategories = ['baseStatUp', 'baseStatUpAmplify'] as const;
export type SkillEffectCategory = (typeof skillEffectCategories)[number];

export const skillEffectCategoryMap = {
  mapleHero: 'baseStatUp',
  pirateFlag: 'baseStatUp',
  pirateFlagVI: 'baseStatUp',
  otherworldlyAfterimage: 'baseStatUp',
  otherworldlyAfterimageVI: 'baseStatUp',
  mapleWorldGoddessBlessing: 'baseStatUpAmplify',
} as const satisfies Record<SkillEffectKey, SkillEffectCategory>;
