export interface SkillData {
  [skillCode: string]: Record<string, number | string>;
}

export interface TransformedData {
  [key: string]: Array<Record<string, number | string>>;
}

/**
 * 스킬 데이터를 키 기준으로 역전시켜 새로운 구조로 변환
 */
export function transformSkillData(data: SkillData): TransformedData {
  const result: TransformedData = {};

  // 1. 스킬코드 순회
  for (const skillCode in data) {
    const skillInfo = data[skillCode];

    // 2. 각 스킬의 속성 순회
    for (const key in skillInfo) {
      const value = skillInfo[key];

      // result에 key가 없으면 초기화
      if (!result[key]) {
        result[key] = [];
      }

      // 배열에 { skillCode: value } 형태로 추가
      result[key].push({ [skillCode]: value });
    }
  }

  return result;
}
