const fs = require("fs");
const csv = require("csvtojson");

const inputPath = "./ms_skillCommon.csv";
const outputPath = "./skillCommon.json";

csv()
  .fromFile(inputPath)
  .then((rows) => {
    const result = {};

    for (const row of rows) {
      const { skillID, commonName, commonValue } = row;

      if (!result[skillID]) result[skillID] = {};

      if (!commonName || !commonValue) {
        console.warn(
          `⚠️ 누락된 값: [${skillID}] ${commonName} = ${commonValue}`,
        );
        continue;
      }

      const value =
        isNaN(Number(commonValue)) ||
        commonValue.includes("+") ||
        commonValue.includes("*")
          ? commonValue
          : Number(commonValue);

      result[skillID][commonName] = value;
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`✅ 변환 완료: ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ 변환 실패:", err);
  });
