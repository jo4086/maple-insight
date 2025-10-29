const fs = require('fs');

const args = process.argv.slice(2);
const version = args[0];

const defaultPath = `../data/_test/${version}`;
const inputPath = `${defaultPath}/json`;
const outputPath = `${defaultPath}/sanitize`;

const jobs = JSON.parse(fs.readFileSync(`${inputPath}/job.json`, 'utf-8'));
const skills = JSON.parse(fs.readFileSync(`${inputPath}/skill.json`, 'utf-8'));

const skillJobIDs = new Set(skills.map((s) => s.jobID));

const jobsWithoutSkills = jobs.filter((j) => !skillJobIDs.has(j.jobID));

const jobsWithSkills = jobs.filter((j) => skillJobIDs.has(j.jobID));

console.log('스킬 없는 직업 목록:');
console.log(jobsWithoutSkills);

fs.writeFileSync(`${outputPath}/job_without_skill.json`, JSON.stringify(jobsWithoutSkills, null, 2), 'utf-8');

fs.writeFileSync(`${outputPath}/job_with_skill.json`, JSON.stringify(jobsWithSkills, null, 2), 'utf-8');

console.log('job_with_skill.json 파일 생성 완료');
