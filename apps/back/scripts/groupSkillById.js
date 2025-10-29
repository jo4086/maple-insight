const fs = require('fs');

const args = process.argv.slice(2);
const server = args[0];

const defaultPath = `../data/_test/${server}`;
const inputPath = `${defaultPath}/json`;
const outputPath = `${defaultPath}/sanitize`;

const skills = JSON.parse(fs.readFileSync(`${inputPath}/skill.json`, 'utf-8'));

const grouped = {};

skills.forEach((skill) => {
  const { jobID, skillID, ...rest } = skill;

  if (!grouped[jobID]) {
    grouped[jobID] = {
      skillIDs: [],
      details: {},
    };
  }

  grouped[jobID].skillIDs.push(skillID);

  grouped[jobID].details[skillID] = rest;
});

fs.writeFileSync(`${outputPath}/skills_grouped.json`, JSON.stringify(grouped, null, 2), 'utf-8');

console.log('skills_grouped.json OK');
