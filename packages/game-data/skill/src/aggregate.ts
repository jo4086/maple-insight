import type { AggregateRawSkillsInput, RawSkillAggregate } from '@@types';
import { groupBy, groupCommonBySkillId } from '@@util';

export function aggregateRawSkills(input: AggregateRawSkillsInput): RawSkillAggregate[] {
  const jobById = new Map(input.jobs.map((job) => [job.jobID, job]));
  const commonBySkillId = groupCommonBySkillId(input.commons);
  const hintBySkillId = new Map(input.hints.map((hint) => [hint.skillID, hint]));
  const levelsBySkillId = groupBy(input.levels, (row) => row.skillID);

  return input.skills.map((skill) => {
    const job = jobById.get(skill.jobID);

    if (!job) {
      throw new Error(`Missing job row: ${skill.jobID}`);
    }

    return {
      job,
      skill,
      common: commonBySkillId.get(skill.skillID) ?? {},
      hint: hintBySkillId.get(skill.skillID),
      levels: [...(levelsBySkillId.get(skill.skillID) ?? [])].sort((a, b) => Number(a.level) - Number(b.level)),
    };
  });
}
