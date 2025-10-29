import { readFileSync, writeFileSync } from 'fs';

// JSON의 타입
interface TransformedData {
  [key: string]: unknown;
}

function extractKeysAndLength(data: TransformedData) {
  const keys = Object.keys(data); // 최상위 key 배열
  const length = keys.length; // key 개수
  return { keys, length };
}

function main() {
  const inputPath = '../json/skillCommonTrans2.json'; // JSON 파일 경로 직접 입력
  const outputPath = '../json/skillCommonLength.json'; // 결과 JSON 저장 경로 직접 입력

  if (!inputPath || !outputPath) {
    console.error('❌ inputPath와 outputPath를 설정해주세요.');
    return;
  }

  try {
    // JSON 파일 읽기
    const rawData = readFileSync(inputPath, 'utf-8');
    const parsedData: TransformedData = JSON.parse(rawData);

    // key와 key 개수 추출
    const { keys, length } = extractKeysAndLength(parsedData);

    // 순서를 length -> keys 순으로 지정
    const orderedData = {
      length,
      keys,
    };

    // JSON 파일로 저장
    writeFileSync(outputPath, JSON.stringify(orderedData, null, 2), 'utf-8');
    console.log(`변환 완료! 결과가 ${outputPath} 에 저장되었습니다.`);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main();
