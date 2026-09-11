import { sixthClassEnhancementBaseMap, sixthClassEnhancementOverrides } from '@maple/data-skill';
import type { SixthClassEnhancementMap } from '@maple/data-skill';

type SixthClassEnhancementBaseMap = typeof sixthClassEnhancementBaseMap;

const toEnhancementSkills = <TSkill extends string>(skills: readonly TSkill[]): readonly `${TSkill} 강화`[] => {
  return skills.map((skill) => `${skill} 강화` as const);
};

export function resolveSixthClassEnhancementRule<TClass extends keyof SixthClassEnhancementBaseMap>(className: TClass): SixthClassEnhancementMap[TClass] {
  return (
    sixthClassEnhancementOverrides[className as keyof typeof sixthClassEnhancementOverrides] ?? {
      skills: toEnhancementSkills(sixthClassEnhancementBaseMap[className].skills),
    }
  );
}

export function createSixthClassEnhancementMap(): SixthClassEnhancementMap {
  return Object.fromEntries(
    Object.keys(sixthClassEnhancementBaseMap).map((className) => [className, resolveSixthClassEnhancementRule(className as keyof SixthClassEnhancementBaseMap)]),
  ) as SixthClassEnhancementMap;
}
