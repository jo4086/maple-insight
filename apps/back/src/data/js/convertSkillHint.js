const fs = require("fs");
const csv = require("csvtojson");

const inputPath = "./ms_skillH.csv"; // 원본 CSV 경로
const outputPath = "./skillHint.json"; // 출력 JSON 경로

csv()
  .fromFile(inputPath)
  .then((rows) => {
    const temp = {};

    for (const row of rows) {
      const { skillID, desc, pdesc, h, ph, hch } = row;

      temp[skillID] = {
        desc,
        pdesc,
        h,
        ph,
        hch,
      };
    }

    // skillID 기준 정렬
    const sorted = Object.keys(temp)
      .sort((a, b) => Number(a) - Number(b))
      .reduce((acc, key) => {
        acc[key] = temp[key];
        return acc;
      }, {});

    //   const sorted = Object.keys(temp)
    // .sort((a, b) => Number(a) - Number(b)) // ← 숫자 비교!
    // .reduce((acc, key) => {
    //   acc[key] = temp[key];
    //   return acc;
    // }, {});

    fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2), "utf-8");
    console.log(`✅ 변환 완료: ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ 변환 실패:", err);
  });
