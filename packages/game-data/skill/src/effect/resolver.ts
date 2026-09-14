import { skillEffectCategoryMap, type SkillEffectCategory, type SkillEffectKey } from './definition';
import { skillNameEffectKeyMap } from './mapper';

function hasOwn<T extends object>(object: T, key: PropertyKey): key is keyof T {
  return Object.hasOwn(object, key);
}

export function resolveSkillEffectKey(skillName: string): SkillEffectKey | undefined {
  return hasOwn(skillNameEffectKeyMap, skillName) ? skillNameEffectKeyMap[skillName] : undefined;
}

export function resolveSkillEffectCategory(skillName: string): SkillEffectCategory | undefined {
  const effectKey = resolveSkillEffectKey(skillName);

  return effectKey ? skillEffectCategoryMap[effectKey] : undefined;
}

export function isSkillEffectCategory(skillName: string, category: SkillEffectCategory): boolean {
  return resolveSkillEffectCategory(skillName) === category;
}
