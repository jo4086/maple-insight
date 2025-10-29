import type { SkillCode, SummaryData } from './u.type';

export function findSkillRelations(summaryData: SummaryData, skillCode: SkillCode) {
  const result: Array<{
    attribute: string;
    value: string;
    totalCount: number;
    count: number;
    ratio: number;
  }> = [];

  for (const attr in summaryData) {
    const attrData = summaryData[attr];

    for (const valueGroup of attrData.values) {
      const valueKey = Object.keys(valueGroup)[0];
      const valueDetail = valueGroup[valueKey];

      if (valueDetail.skills.includes(skillCode)) {
        result.push({
          attribute: attr,
          value: valueKey,
          totalCount: attrData.totalCount,
          count: valueDetail.count,
          ratio: valueDetail.ratio,
        });
      }
    }
  }

  return result;
}
