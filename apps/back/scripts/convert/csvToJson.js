const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const args = process.argv.slice(2);
const version = args[0];

if (!version) {
  console.error('⚠️  사용법: node convert.js <version>');
  process.exit(1);
}

const inputPath = path.join(__dirname, `../../data/_test/${version}/`);
const outputPath = path.join(__dirname, `../../data/_test/${version}/json/`);

console.log('입력 경로:', inputPath);
console.log('출력 경로:', outputPath);

// 출력 폴더가 없으면 생성
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// CSV 파일 목록 읽기
fs.readdir(inputPath, (err, files) => {
  if (err) {
    console.error('❌ 경로를 읽을 수 없습니다:', err);
    return;
  }

  const csvFiles = files.filter((file) => file.endsWith('.csv'));

  if (csvFiles.length === 0) {
    console.log('⚠️ CSV 파일이 없습니다.');
    return;
  }

  csvFiles.forEach((file) => {
    const filePath = path.join(inputPath, file);

    // 파일명에서 접두어 "ms_" 제거 + 확장자 변경
    let baseName = file.replace(/^ms_/, ''); // ms_ 제거
    baseName = baseName.replace(/\.csv$/, '.json'); // 확장자 변경
    const outFile = path.join(outputPath, baseName);

    csv()
      .fromFile(filePath)
      .then((jsonObj) => {
        fs.writeFileSync(outFile, JSON.stringify(jsonObj, null, 2), 'utf-8');
        console.log(`✅ 변환 완료: ${file} → ${outFile}`);
      })
      .catch((err) => {
        console.error(`❌ 변환 실패: ${file}`, err);
      });
  });
});

console.log(args);
console.log(inputPath);
