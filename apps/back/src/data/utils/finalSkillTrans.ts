import { readFileSync, writeFileSync } from 'fs';
import type { AttributeData, SummaryData } from './u.type';

export function transformWithSummary(data: AttributeData): SummaryData {
  const result: SummaryData = {};

  for (const attr in data) {
    const valueGroups = data[attr];

    // totalCount 계산
    const totalCount = valueGroups.reduce((acc, group) => {
      const valueKey = Object.keys(group)[0];
      return acc + group[valueKey].length;
    }, 0);

    // values 변환
    const values = valueGroups.map((group) => {
      const valueKey = Object.keys(group)[0];
      const skills = group[valueKey];
      const count = skills.length;
      const ratio = parseFloat(((count / totalCount) * 100).toFixed(2)); // 비율(%)

      return {
        [valueKey]: {
          count,
          ratio,
          skills,
        },
      };
    });

    result[attr] = {
      length: valueGroups.length,
      totalCount,
      values,
    };
  }

  return result;
}

function main() {
  const inputPath = '../json/skillCommonTrans2.json'; // 원본 JSON 경로
  const outputPath = '../json/skillCommonFinal.json'; // 결과 JSON 경로

  if (!inputPath || !outputPath) {
    console.error('❌ inputPath와 outputPath를 설정해주세요.');
    return;
  }

  try {
    const rawData = readFileSync(inputPath, 'utf-8');
    const parsedData: AttributeData = JSON.parse(rawData);

    const transformed = transformWithSummary(parsedData);

    writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    console.log(`변환 완료! 결과가 ${outputPath} 에 저장되었습니다.`);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main();
