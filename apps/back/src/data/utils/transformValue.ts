import { readFileSync, writeFileSync } from 'fs';

type PrimitiveValue = string | number;

interface SkillDetail {
  [key: string]: PrimitiveValue;
}

interface SkillData {
  [skillCode: string]: SkillDetail;
}

interface GroupedValue {
  [value: string]: string[];
}

interface TransformedData {
  [attribute: string]: Array<GroupedValue>;
}

function transformSkillData(data: SkillData): TransformedData {
  const result: Record<string, Record<string, string[]>> = {};

  // 1. skillCode 순회
  for (const skillCode in data) {
    const skillInfo = data[skillCode];

    // 2. 각 스킬 내부 속성 순회
    for (const attr in skillInfo) {
      const value = skillInfo[attr];

      if (!result[attr]) {
        result[attr] = {};
      }

      const valueKey = String(value);

      // 해당 속성값(valueKey)이 없다면 초기화
      if (!result[attr][valueKey]) {
        result[attr][valueKey] = [];
      }

      // 스킬 코드 추가
      result[attr][valueKey].push(skillCode);
    }
  }

  // 3. 최종 구조를 원하는 형태로 변환
  const finalResult: TransformedData = {};

  for (const attr in result) {
    finalResult[attr] = Object.entries(result[attr]).map(([valueKey, skillCodes]) => ({
      [valueKey]: skillCodes,
    }));
  }

  return finalResult;
}

function main() {
  const inputPath = '../json/skillCommon.json'; // 원본 JSON 파일 경로
  const outputPath = '../json/skillCommonTrans2.json'; // 결과 JSON 저장 경로

  if (!inputPath || !outputPath) {
    console.error('❌ inputPath와 outputPath를 설정해주세요.');
    return;
  }

  try {
    const rawData = readFileSync(inputPath, 'utf-8');
    const parsedData: SkillData = JSON.parse(rawData);

    const transformed = transformSkillData(parsedData);

    writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');

    console.log('변환 완료! 결과가', outputPath, '에 저장되었습니다.');
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main();
