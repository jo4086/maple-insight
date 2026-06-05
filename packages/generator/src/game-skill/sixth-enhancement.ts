import { fifthClassSkillMap, sixthClassEnhancementOverrides } from '@maple/data-skill';
import type { SixthClassEnhancementMap } from '@maple/data-skill';

type FifthClassSkillMap = typeof fifthClassSkillMap;

const toEnhancementSkills = <TSkill extends string>(skills: readonly TSkill[]): readonly `${TSkill} 강화`[] => {
  return skills.map((skill) => `${skill} 강화` as const);
};

export function resolveSixthClassEnhancementRule<TClass extends keyof FifthClassSkillMap>(className: TClass): SixthClassEnhancementMap[TClass] {
  return (
    sixthClassEnhancementOverrides[className as keyof typeof sixthClassEnhancementOverrides] ?? {
      skills: toEnhancementSkills(fifthClassSkillMap[className].skills),
    }
  );
}

export function createSixthClassEnhancementMap(): SixthClassEnhancementMap {
  return Object.fromEntries(
    Object.keys(fifthClassSkillMap).map((className) => [className, resolveSixthClassEnhancementRule(className as keyof FifthClassSkillMap)]),
  ) as SixthClassEnhancementMap;
}
