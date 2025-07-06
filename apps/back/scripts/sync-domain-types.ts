// 📂 scripts/sync-domain-types.ts
import { execSync } from 'child_process';
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const domainPath = join(__dirname, '../src/domain');
const targetFile = join(__dirname, '../src/cache/cache.type.ts');
const indexTargetFile = join(__dirname, '../src/cache/index.ts');

const folders = readdirSync(domainPath).filter((file) =>
  statSync(join(domainPath, file)).isDirectory(),
);

// 자동 타입 마커
const startMarker = '// WARN: 자동 생성 데이터 ↓ (수정 금지)';
const endMarker = '// WARN: 자동 생성 데이터 ↑ (수정 금지)';

// 자동 타입 생성
const generatedTypes = `export type DomainType =\n  ${folders.map((f) => `| '${f}'`).join('\n  ')};\n\n`;

/*  +
  `export const DomainList: DomainType[] = [${folders.map((f) => `'${f}'`).join(', ')}];\n`;
*/

// 1. 도메인 타입 성생
// 파일 읽기
let updatedContent = '';
if (!existsSync(targetFile)) {
  // 파일 없으면 새로 생성
  const defaultContent = `// INFO: 자동 생성 파일 (수정시 주의)\n\n${startMarker}\n${generatedTypes}${endMarker}\n\n// 추가 수동 타입은 아래에 작성 가능\n`;
  writeFileSync(targetFile, defaultContent, 'utf-8');
  console.log(`✅ 새 타입 파일 생성됨: ${targetFile}`);
} else {
  const fileContent = readFileSync(targetFile, 'utf-8');

  const startIdx = fileContent.indexOf(startMarker);
  const endIdx = fileContent.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('❌ 마커 주석을 찾을 수 없습니다. 파일을 확인하세요.');
    process.exit(1);
  }

  const before = fileContent.slice(0, startIdx + startMarker.length);
  const after = fileContent.slice(endIdx); // endMarker 포함

  updatedContent = `${before}\n${generatedTypes}${after}`;

  writeFileSync(targetFile, updatedContent, 'utf-8');
  console.log('✅ 타입 파일 자동 동기화 완료 (강력 복구 모드)');
}

try {
  execSync(`npx prettier --write ${targetFile}`, { stdio: 'inherit' });
  console.log('✅ Prettier 포맷팅 적용 완료');
} catch (error) {
  console.error('❌ Prettier 포맷팅 실패:', error);
}

// 2. 도메인 리스트 생성
const domainListContent = `const DomainList: DomainType[] = [${folders.map((f) => `'${f}'`).join(', ')}];\n`;

updatedContent = '';

if (!existsSync(indexTargetFile)) {
  console.warn(indexTargetFile, '파일이 존재하지 않습니다.');
} else {
  const fileContent = readFileSync(indexTargetFile, 'utf-8');

  const startIdx = fileContent.indexOf(startMarker);
  const endIdx = fileContent.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('❌ 마커 주석을 찾을 수 없습니다. 파일을 확인하세요.');
    process.exit(1);
  }

  const before = fileContent.slice(0, startIdx + startMarker.length);
  const after = fileContent.slice(endIdx); // endMarker 포함

  updatedContent = `${before}\n${domainListContent}${after}`;

  writeFileSync(indexTargetFile, updatedContent, 'utf-8');
  console.log('✅ 타입 파일 리스트 자동 동기화 완료 (강력 복구 모드)');
}
