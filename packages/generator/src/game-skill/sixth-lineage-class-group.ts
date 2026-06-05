import { sixthLineageClassGroupSkillOverrides, sixthLineageClassGroupSkills } from '@maple/data-skill';
import type { SixthLineageClassGroupSkill, SixthLineageClassGroupSkillMap, SkillLinkedGroups } from '@maple/data-skill';

const toSixthSkillName = (skill: string): SixthLineageClassGroupSkill => `${skill} VI` as SixthLineageClassGroupSkill;

export function resolveSixthLineageClassGroupSkillRule(skill: string): SkillLinkedGroups {
  const sixthSkillName = toSixthSkillName(skill);

  return (
    sixthLineageClassGroupSkillOverrides[sixthSkillName as keyof typeof sixthLineageClassGroupSkillOverrides] ?? {
      skills: [sixthSkillName],
    }
  );
}

export function createSixthLineageClassGroupSkillMap(): Record<SixthLineageClassGroupSkill, NonNullable<SixthLineageClassGroupSkillMap[SixthLineageClassGroupSkill]>> {
  const skillMap = {} as Record<SixthLineageClassGroupSkill, NonNullable<SixthLineageClassGroupSkillMap[SixthLineageClassGroupSkill]>>;

  for (const sixthSkillName of sixthLineageClassGroupSkills) {
    skillMap[sixthSkillName] = sixthLineageClassGroupSkillOverrides[sixthSkillName as keyof typeof sixthLineageClassGroupSkillOverrides] ?? {
      skills: [sixthSkillName],
    };
  }

  return skillMap;
}
