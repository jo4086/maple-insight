import { getRawJobCategoryByJobId, rawJobCategoryMap } from '../raw';
import type { RawJobCategory } from '../raw';

/**
 * 스킬 코어/헥사 계열 원본 jobID 분류.
 *
 * 실제 직업 전직 jobID가 아니라 공용 코어, 직업군 코어, 6차 공용/특수 강화,
 * 헥사스탯처럼 별도 raw jobID에 담긴 스킬 묶음을 식별하기 위한 규칙이다.
 */
export const skillRawJobCategoryMap = rawJobCategoryMap;

export type SkillRawJobCategoryId = keyof typeof skillRawJobCategoryMap;

export function getSkillRawJobCategory(jobID: string): RawJobCategory | undefined {
  return getRawJobCategoryByJobId(jobID);
}
