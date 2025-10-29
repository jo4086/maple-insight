// 폴더 위치: src/transform.ts

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface SkillData {
  [skillCode: string]: Record<string, number | string>;
}

interface TransformedData {
  [key: string]: Array<Record<string, number | string>>;
}

/**
 * 스킬 데이터를 키 중심으로 역전환하는 함수
 */
function transformSkillData(data: SkillData): TransformedData {
  const result: TransformedData = {};

  // 1. 스킬 코드 순회
  for (const skillCode in data) {
    const skillInfo = data[skillCode];

    // 2. 각 스킬의 속성(key, value) 순회
    for (const key in skillInfo) {
      const value = skillInfo[key];

      // 3. result에 key가 없으면 초기화
      if (!result[key]) {
        result[key] = [];
      }

      // 4. 배열에 { skillCode: value } 형태로 추가
      result[key].push({ [skillCode]: value });
    }
  }

  return result;
}

/**
 * 실행 로직
 */
function main() {
  // === 경로를 직접 입력해서 사용하세요 ===
  const inputPath = '../json/skillCommon.json'; // 원본 JSON 파일 경로 (예: './data/skills.json')
  const outputPath = '../json/skillCommonTrans.json'; // 결과 저장 JSON 파일 경로 (예: './data/output.json')

  try {
    if (!inputPath || !outputPath) {
      console.error('❌ inputPath와 outputPath를 설정해주세요.');
      return;
    }

    console.log('JSON 파일 읽는 중...');

    // 1. JSON 파일 읽기
    const rawData = readFileSync(resolve(inputPath), 'utf-8');
    const skillData: SkillData = JSON.parse(rawData);

    console.log('데이터 변환 중...');
    // 2. 변환 수행
    const transformed = transformSkillData(skillData);

    // 3. 결과 저장
    writeFileSync(resolve(outputPath), JSON.stringify(transformed, null, 2), 'utf-8');

    console.log(`변환 완료! 결과가 ${outputPath} 에 저장되었습니다.`);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

// 스크립트 실행
main();
