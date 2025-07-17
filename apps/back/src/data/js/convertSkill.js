const fs = require("fs");
const csv = require("csvtojson");

const inputPath = "./ms_skill.csv"; // CSV 경로
const outputPath = "./skill.json"; // 출력 파일

csv()
  .fromFile(inputPath)
  .then((rows) => {
    const result = {};

    for (const row of rows) {
      const {
        jobID,
        skillID,
        skillName,
        skillDesc,
        maxLevel,
        invisible,
        hyper,
        reqSkill,
        reqSkillLevel,
        reqLevel,
      } = row;

      if (!result[jobID]) result[jobID] = {};

      result[jobID][skillID] = {
        skillName,
        skillDesc: skillDesc?.replace(/\\n/g, "\n").replace(/#c(.*?)#/g, "$1"), // \n 처리 및 #c 제거
        maxLevel: Number(maxLevel),
        invisible: invisible === "TRUE",
        hyper: Number(hyper),
        reqSkill,
        reqSkillLevel: Number(reqSkillLevel),
        reqLevel: Number(reqLevel),
      };
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`✅ 변환 완료 → ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ 변환 실패:", err);
  });
