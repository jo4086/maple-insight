const fs = require("fs");
const csv = require("csvtojson");

const inputPath = "./ms_skillLevel.csv"; // 고정값: 네 CSV 파일
const outputPath = "./skillLevel.json"; // 결과 저장 위치

csv()
  .fromFile(inputPath)
  .then((rows) => {
    const result = {};

    for (const row of rows) {
      const { skillID, level, levelDesc } = row;

      // level 1만 저장
      if (level === "1") {
        result[skillID] = {
          1: levelDesc,
        };
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`✅ 변환 완료: ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ 변환 에러:", err);
  });
