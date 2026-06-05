import { commonSkillGroupCombinations, type CommonSkillGroup } from '@maple/game-data';

export const resolveCommonSkillGroups = (commonGroups: readonly CommonSkillGroup[]): CommonSkillGroup[] => {
  const resolvedGroups = new Set(commonGroups);

  commonSkillGroupCombinations.forEach(({ required, resolved }) => {
    if (required.every((group) => resolvedGroups.has(group))) {
      resolvedGroups.add(resolved);
    }
  });

  return Array.from(resolvedGroups);
};
