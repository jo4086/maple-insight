const fs = require("fs");
const csv = require("csvtojson");

const inputPath = "./ms_job.csv"; // 입력 CSV 경로
const outputPath = "./job.json"; // 출력 JSON 경로

csv()
  .fromFile(inputPath)
  .then((rows) => {
    const result = {};

    for (const row of rows) {
      const { jobID, jobName } = row;

      // key는 항상 문자열로 처리
      result[jobID.toString()] = jobName || ""; // 빈 값도 허용
    }

    // 숫자 기준 정렬
    const sorted = Object.keys(result)
      .sort((a, b) => Number(a) - Number(b))
      .reduce((acc, key) => {
        acc[key] = result[key];
        return acc;
      }, {});

    fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2), "utf-8");
    console.log(`✅ jobName 변환 완료: ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ 변환 실패:", err);
  });
