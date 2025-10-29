import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const version = args[0];

const DEFAULT_PATH = `../data/_test/${version}/sanitize`;

const DEFAULT_INPUT = `${DEFAULT_PATH}/job_with_skill.json`;
const DEFAULT_OUTPUT = `${DEFAULT_PATH}/grouped-jobs.json`;

type Range = [number, number];

type Job = {
  jobID: string;
  jobName: string;
};

type GroupRange = {
  name: string;
  range: Range;
};

// === 1) 주어진 validRanges를 '그룹명 포함' 형태로 정의 ===
const groupRanges: GroupRange[] = [
  { name: 'Adventurer', range: [0, 599] },
  { name: 'Cygnus Knights', range: [1000, 1599] },
  { name: 'Heroes', range: [2000, 2999] },
  { name: 'Resistance', range: [3000, 3999] },
  { name: 'Mikhail', range: [5000, 5599] },
  { name: 'Nova', range: [6000, 6599] },
  { name: 'Zero', range: [10000, 10999] },
  { name: 'Event: Kamado Tanjiro', range: [12005, 12100] },
  { name: 'Event: Pink Bean & Yeti', range: [13000, 13500] },
  { name: 'Kinesis', range: [14000, 14299] },
  { name: 'Lef', range: [15000, 15599] },
  { name: 'Anima', range: [16000, 16599] },
  { name: '5th: Common Group', range: [40000, 40000] },
  { name: '5th: Warrior', range: [40001, 40001] },
  { name: '5th: Mage', range: [40002, 40002] },
  { name: '5th: Archer', range: [40003, 40003] },
  { name: '5th: Thief', range: [40004, 40004] },
  { name: '5th: Pirate', range: [40005, 40005] },
  { name: 'Hexa: All (Skill Info)', range: [50000, 50000] },
  { name: '5th: All (Skill Core)', range: [50006, 50006] },
  { name: 'Hexa: Stat', range: [50007, 50007] },
  { name: 'Ability', range: [800004, 800004] },
];

// === 2) 유틸: jobID("000" 등) → number 변환 ===
function toNumericId(jobIdStr: string): number | null {
  // 숫자 외 문자가 섞일 가능성 방어
  if (!/^\d+$/.test(jobIdStr)) return null;
  // 선행 0 유지하되 숫자값으로 비교
  return parseInt(jobIdStr, 10);
}

// === 3) 유틸: 숫자 ID가 어떤 그룹에 속하는지 찾기 ===
function findGroupName(numericId: number): string | null {
  for (const g of groupRanges) {
    const [start, end] = g.range;
    if (numericId >= start && numericId <= end) {
      return g.name;
    }
  }
  return null;
}

// === 4) 메인 ===
function main() {
  // CLI 인자 처리 (예시)
  const args = process.argv.slice(2);
  const inIdx = args.indexOf('--in');
  const outIdx = args.indexOf('--out');

  const inputPath = inIdx !== -1 ? args[inIdx + 1] : DEFAULT_INPUT; // (예시)
  const outputPath = outIdx !== -1 ? args[outIdx + 1] : DEFAULT_OUTPUT; // (예시)

  // 입력 파일 읽기
  const raw = fs.readFileSync(path.resolve(inputPath), 'utf-8');
  const list: Job[] = JSON.parse(raw);

  // 결과 구조: { [groupName]: Job[] }
  const grouped: Record<string, Job[]> = {};

  let total = 0;
  let included = 0;
  let excluded = 0;

  for (const item of list) {
    total++;
    const n = toNumericId(item.jobID);
    if (n === null) {
      excluded++;
      continue;
    }
    const group = findGroupName(n);
    if (!group) {
      // 지정된 범위에 없는 것은 제외
      excluded++;
      continue;
    }
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
    included++;
  }

  // 출력 디렉토리 보장
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // 정렬(선택): 각 그룹 내 jobID 오름차순
  for (const g of Object.keys(grouped)) {
    grouped[g].sort((a, b) => {
      const na = toNumericId(a.jobID) ?? 0;
      const nb = toNumericId(b.jobID) ?? 0;
      return na - nb;
    });
  }

  // 결과 JSON 저장
  fs.writeFileSync(path.resolve(outputPath), JSON.stringify(grouped, null, 2), 'utf-8');

  // 간단 리포트
  console.log('[job-grouper] 총 항목:', total);
  console.log('[job-grouper] 포함됨:', included);
  console.log('[job-grouper] 제외됨(범위 외/형식오류):', excluded);
  console.log('[job-grouper] 출력 파일:', outputPath);
}

main();
