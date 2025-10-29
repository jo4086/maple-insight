import { readFileSync } from 'fs';

import { transformWithSummary } from '../utils/finalSkillTrans';
import { findSkillRelations } from '../utils/findSkill';
import type { AttributeData } from '../utils/u.type';

// 1. 원본 JSON 읽기
const rawData = readFileSync('../json/skillCommonTrans2.json', 'utf-8');
const parsedData: AttributeData = JSON.parse(rawData);

// 2. 변환 함수로 summary 구조 만들기
const transformedData = transformWithSummary(parsedData);

// 3. 특정 스킬코드 검색
const skillCodeToFind = '400041006';
const related = findSkillRelations(transformedData, skillCodeToFind);

// 4. 검색 결과 출력
console.log(JSON.stringify(related, null, 2));
