import type { PotentialGrade } from '../types';
import { createPotentialOptionGradeRow as row, createPotentialOptionGradeTable as table, isPotentialOptionLevelInRange, parsePotentialOptionLevelRange } from './builder';
import { potentialOptionScopes } from '../types/option';
import type {
  PotentialOptionGradeKind,
  PotentialOptionGradePartCondition,
  PotentialOptionGradeRow,
  PotentialOptionGradeTable,
  PotentialOptionGradeTextMap,
  PotentialOptionTextsByGrade,
  PotentialOptionTextsByLevelGradeScope,
} from './types';

const attackMagicTemplates = ['공격력 {value}', '마력 {value}'] as const;
const singleStatTemplates = ['STR {value}', 'DEX {value}', 'INT {value}', 'LUK {value}'] as const;
const maxHpMpTemplates = ['최대 HP {value}', '최대 MP {value}'] as const;
const speedJumpTemplates = ['이동속도 {value}', '점프력 {value}'] as const;
const dropMesoTemplates = ['아이템 드롭률 {value}', '메소 획득량 {value}'] as const;
const weaponPotentialParts = { include: ['무기', '보조무기', '엠블렘'] } as const satisfies PotentialOptionGradePartCondition;
const excludeWeaponPotentialParts = { exclude: ['무기', '보조무기', '엠블렘'] } as const satisfies PotentialOptionGradePartCondition;
const allPotentialParts = { include: ['all'] } as const satisfies PotentialOptionGradePartCondition;
const hatPotentialParts = { include: ['모자'] } as const satisfies PotentialOptionGradePartCondition;
const topOverallPotentialParts = { include: ['상의', '한벌옷'] } as const satisfies PotentialOptionGradePartCondition;
const armorPotentialParts = { include: ['모자', '상의', '하의', '한벌옷', '망토', '신발', '장갑'] } as const satisfies PotentialOptionGradePartCondition;
const topBottomOverallPotentialParts = { include: ['상의', '하의', '한벌옷'] } as const satisfies PotentialOptionGradePartCondition;
const armorBeltShoulderPotentialParts = { include: ['모자', '상의', '하의', '한벌옷', '망토', '신발', '장갑', '벨트', '어깨장식'] } as const satisfies PotentialOptionGradePartCondition;
const armorBeltShoulderWithoutGlovesPotentialParts = { include: ['모자', '상의', '하의', '한벌옷', '망토', '신발', '벨트', '어깨장식'] } as const satisfies PotentialOptionGradePartCondition;
const subWeaponArmorBeltShoulderPotentialParts = { include: ['보조무기', '모자', '상의', '하의', '한벌옷', '망토', '신발', '장갑', '벨트', '어깨장식'] } as const satisfies PotentialOptionGradePartCondition;
const glovesPotentialParts = { include: ['장갑'] } as const satisfies PotentialOptionGradePartCondition;
const bottomPotentialParts = { include: ['하의'] } as const satisfies PotentialOptionGradePartCondition;
const shoesPotentialParts = { include: ['신발'] } as const satisfies PotentialOptionGradePartCondition;
const accessoryPotentialParts = { include: ['반지', '펜던트', '눈장식', '얼굴장식', '귀고리'] } as const satisfies PotentialOptionGradePartCondition;

const potentialGradeOrder = ['normal', 'rare', 'epic', 'unique', 'legendary'] as const satisfies readonly PotentialGrade[];

const potentialGradeRankMap = {
  normal: 0,
  rare: 1,
  epic: 2,
  unique: 3,
  legendary: 4,
} as const satisfies Record<PotentialGrade, number>;

export const emptyPotentialOptionTextsByGrade = {
  normal: [],
  rare: [],
  epic: [],
  unique: [],
  legendary: [],
} as const satisfies PotentialOptionTextsByGrade;

const sharedRateRows = withAdditionalRows([
  row('potential', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, attackMagicTemplates),
  row('potential', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, attackMagicTemplates),
  row('potential', '71~249', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, attackMagicTemplates),
  row('potential', '250~', { rare: '+4%', epic: '+7%', unique: '+10%', legendary: '+13%' }, attackMagicTemplates),
]);

const sharedDamageRateRows = withAdditionalRows([
  row('potential', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, '데미지 {value}'),
  row('potential', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, '데미지 {value}'),
  row('potential', '71~249', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, '데미지 {value}'),
  row('potential', '250~', { rare: '+4%', epic: '+7%', unique: '+10%', legendary: '+13%' }, '데미지 {value}'),
]);

const statusDebuffRows = [
  statusDebuffRow('10~20', { poison: 1, darkness: 1, common: 1 }),
  statusDebuffRow('21~40', { poison: 2, darkness: 1, common: 1 }),
  statusDebuffRow('41~50', { poison: 3, darkness: 1, common: 1 }),
  statusDebuffRow('51~60', { poison: 3, darkness: 2, common: 1 }),
  statusDebuffRow('61~70', { poison: 4, darkness: 2, common: 1 }),
  statusDebuffRow('71~80', { poison: 4, darkness: 2, common: 2 }),
  statusDebuffRow('81~100', { poison: 5, darkness: 2, common: 2 }),
  statusDebuffRow('101~200', { poison: 6, darkness: 3, common: 2 }),
  statusDebuffRow('201~', { poison: 7, darkness: 4, common: 3 }),
];

const attackRecoveryRows = [
  attackRecoveryRow('0~10', { hpCashRare: 20, hpCashEpic: 30, hpNormalRare: 10, hpNormalEpic: 20, mpCashRare: 20, mpCashEpic: 30, mpNormalRare: 10, mpNormalEpic: 20 }),
  attackRecoveryRow('11~20', { hpCashRare: 40, hpCashEpic: 60, hpNormalRare: 12, hpNormalEpic: 23, mpCashRare: 30, mpCashEpic: 45, mpNormalRare: 12, mpNormalEpic: 23 }),
  attackRecoveryRow('21~30', { hpCashRare: 60, hpCashEpic: 90, hpNormalRare: 14, hpNormalEpic: 26, mpCashRare: 40, mpCashEpic: 60, mpNormalRare: 14, mpNormalEpic: 26 }),
  attackRecoveryRow('31~40', { hpCashRare: 80, hpCashEpic: 120, hpNormalRare: 16, hpNormalEpic: 29, mpCashRare: 50, mpCashEpic: 75, mpNormalRare: 16, mpNormalEpic: 29 }),
  attackRecoveryRow('41~50', { hpCashRare: 100, hpCashEpic: 150, hpNormalRare: 18, hpNormalEpic: 32, mpCashRare: 60, mpCashEpic: 90, mpNormalRare: 18, mpNormalEpic: 32 }),
  attackRecoveryRow('51~60', { hpCashRare: 120, hpCashEpic: 180, hpNormalRare: 20, hpNormalEpic: 35, mpCashRare: 70, mpCashEpic: 105, mpNormalRare: 20, mpNormalEpic: 35 }),
  attackRecoveryRow('61~70', { hpCashRare: 140, hpCashEpic: 210, hpNormalRare: 22, hpNormalEpic: 38, mpCashRare: 80, mpCashEpic: 120, mpNormalRare: 22, mpNormalEpic: 38 }),
  attackRecoveryRow('71~80', { hpCashRare: 160, hpCashEpic: 240, hpNormalRare: 24, hpNormalEpic: 41, mpCashRare: 90, mpCashEpic: 135, mpNormalRare: 24, mpNormalEpic: 41 }),
  attackRecoveryRow('81~90', { hpCashRare: 180, hpCashEpic: 270, hpNormalRare: 26, hpNormalEpic: 44, mpCashRare: 100, mpCashEpic: 150, mpNormalRare: 26, mpNormalEpic: 44 }),
  attackRecoveryRow('91~100', { hpCashRare: 200, hpCashEpic: 300, hpNormalRare: 28, hpNormalEpic: 47, mpCashRare: 110, mpCashEpic: 165, mpNormalRare: 28, mpNormalEpic: 47 }),
  attackRecoveryRow('101~110', { hpCashRare: 220, hpCashEpic: 330, hpNormalRare: 30, hpNormalEpic: 50, mpCashRare: 120, mpCashEpic: 180, mpNormalRare: 30, mpNormalEpic: 50 }),
  attackRecoveryRow('111~200', { hpCashRare: 240, hpCashEpic: 360, hpNormalRare: 32, hpNormalEpic: 53, mpCashRare: 120, mpCashEpic: 180, mpNormalRare: 32, mpNormalEpic: 53 }),
  attackRecoveryRow('201~', { hpCashRare: 250, hpCashEpic: 370, hpNormalRare: 33, hpNormalEpic: 54, mpCashRare: 125, mpCashEpic: 195, mpNormalRare: 33, mpNormalEpic: 54 }),
];

export const potentialOptionGradeTables = [
  table('몬스터 방어율 무시', '001.md', [
    row('potential', '50~249', { rare: '+15%', epic: '+15%', unique: '+30%', legendary: ['+35%', '+40%'] }, '몬스터 방어율 무시 {value}'),
    row('potential', '250~', { rare: '+20%', epic: '+20%', unique: '+35%', legendary: ['+40%', '+45%'] }, '몬스터 방어율 무시 {value}'),
    row('additional', '50~249', { rare: '+3%', epic: '+3%', unique: '+4%', legendary: '+5%' }, '몬스터 방어율 무시 {value}'),
    row('additional', '250~', { rare: '+5%', epic: '+5%', unique: '+6%', legendary: '+7%' }, '몬스터 방어율 무시 {value}'),
  ], { part: weaponPotentialParts }),
  table('공격력/마력 % 증가', '001.md', sharedRateRows, { part: weaponPotentialParts }),
  table('보스 몬스터 데미지', '001.md', [
    row('potential', '100~249', { unique: '+30%', legendary: ['+35%', '+40%'] }, '보스 몬스터 데미지 {value}'),
    row('potential', '250~', { unique: '+35%', legendary: ['+40%', '+45%'] }, '보스 몬스터 데미지 {value}'),
    row('additional', '50~249', { unique: '+12%', legendary: '+18%' }, '보스 몬스터 데미지 {value}'),
    row('additional', '250~', { unique: '+14%', legendary: '+20%' }, '보스 몬스터 데미지 {value}'),
  ], { part: weaponPotentialParts }),
  table('데미지', '001.md', sharedDamageRateRows, { part: weaponPotentialParts }),
  table('크리티컬 확률', '001.md', [
    row('potential', '0~249', { rare: '+4%', epic: '+8%', unique: '+9%', legendary: '+12%' }, '크리티컬 확률 {value}'),
    row('potential', '250~', { rare: '+5%', epic: '+9%', unique: '+10%', legendary: '+13%' }, '크리티컬 확률 {value}'),
    row('additional', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, '크리티컬 확률 {value}'),
    row('additional', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, '크리티컬 확률 {value}'),
    row('additional', '71~249', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, '크리티컬 확률 {value}'),
    row('additional', '250~', { rare: '+5%', epic: '+7%', unique: '+10%', legendary: '+13%' }, '크리티컬 확률 {value}'),
  ], { part: weaponPotentialParts }),
  table('공격 시 상태이상 적용', '001.md', statusDebuffRows, { part: weaponPotentialParts }),
  table('공격 시 HP/MP 회복', '002.md', attackRecoveryRows, { part: weaponPotentialParts }),
  table('공격력/마력 +32', '002.md', [row('potential', '30~', { legendary: '+32' }, attackMagicTemplates), row('additional', '0~', { legendary: '+32' }, attackMagicTemplates)], { part: weaponPotentialParts }),
  table('공격력/마력 고정치 증가', '002.md', [
    row('potential', '0~20', { normal: '+1', rare: '+2' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '21~40', { normal: '+2', rare: '+4' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '41~60', { normal: '+3', rare: '+6' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '61~80', { normal: '+4', rare: '+8' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '81~90', { normal: '+5', rare: '+10' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '91~200', { normal: '+6', rare: '+12' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('potential', '201~', { normal: '+6', rare: '+13' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '0~20', { normal: '+1', rare: '+2' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '21~40', { normal: '+2', rare: '+4' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '41~60', { normal: '+3', rare: '+6' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '61~80', { normal: '+4', rare: '+8' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '81~90', { normal: '+5', rare: '+10' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '91~200', { normal: '+6', rare: '+12' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '201~', { normal: '+6', rare: '+13' }, attackMagicTemplates, { part: weaponPotentialParts }),
    row('additional', '0~20', { normal: '+1', rare: '+1', epic: '+4', unique: '+6', legendary: '+8' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '21~40', { normal: '+1', rare: '+2', epic: '+6', unique: '+8', legendary: '+10' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '41~50', { normal: '+1', rare: '+2', epic: '+6', unique: '+8', legendary: '+10' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '51~60', { normal: '+2', rare: '+4', epic: '+6', unique: '+8', legendary: '+10' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '61~80', { normal: '+2', rare: '+6', epic: '+8', unique: '+10', legendary: '+12' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '81~90', { normal: '+2', rare: '+8', epic: '+8', unique: '+10', legendary: '+12' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '91~100', { normal: '+3', rare: '+10', epic: '+11', unique: '+14', legendary: '+16' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '101~200', { normal: '+3', rare: '+10', epic: '+11', unique: '+14', legendary: '+16' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { normal: '+4', rare: '+11', epic: '+12', unique: '+15', legendary: '+17' }, attackMagicTemplates, { part: excludeWeaponPotentialParts }),
  ]),
  table('단일스탯 고정치 증가', '002.md', [
    row('potential', '0~20', { normal: '+1', rare: '+2' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '21~40', { normal: '+2', rare: '+4' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '41~50', { normal: '+3', rare: '+6' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '51~70', { normal: '+4', rare: '+8' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '71~90', { normal: '+5', rare: '+10' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '91~200', { normal: '+6', rare: '+12' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '201~', { normal: '+6', rare: '+13' }, singleStatTemplates, { part: allPotentialParts }),
    row('additional', '0~20', { normal: '+1', rare: '+2' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '21~40', { normal: '+2', rare: '+4' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '41~50', { normal: '+3', rare: '+6' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '51~70', { normal: '+4', rare: '+8' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '71~90', { normal: '+5', rare: '+10' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '91~200', { normal: '+6', rare: '+12' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '201~', { normal: '+6', rare: '+13' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '0~20', { normal: '+1', rare: '+2', epic: '+4', unique: '+6', legendary: '+8' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '21~40', { normal: '+2', rare: '+4', epic: '+6', unique: '+8', legendary: '+10' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '41~50', { normal: '+3', rare: '+4', epic: '+8', unique: '+10', legendary: '+12' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '51~70', { normal: '+4', rare: '+6', epic: '+10', unique: '+12', legendary: '+14' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '71~90', { normal: '+5', rare: '+8', epic: '+12', unique: '+14', legendary: '+16' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '91~200', { normal: '+6', rare: '+10', epic: '+14', unique: '+18', legendary: '+20' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { normal: '+6', rare: '+11', epic: '+15', unique: '+19', legendary: '+21' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
  ]),
  table('단일스탯 % 증가', '002.md', [
    row('potential', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '71~200', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, singleStatTemplates, { part: allPotentialParts }),
    row('potential', '201~', { rare: '+4%', epic: '+7%', unique: '+10%', legendary: '+13%' }, singleStatTemplates, { part: allPotentialParts }),
    row('additional', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '71~200', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '201~', { rare: '+4%', epic: '+7%', unique: '+10%', legendary: '+13%' }, singleStatTemplates, { part: weaponPotentialParts }),
    row('additional', '0~20', { rare: '+1%', epic: '+1%', unique: '+2%', legendary: '+3%' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '21~50', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+4%' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '51~90', { rare: '+2%', epic: '+3%', unique: '+4%', legendary: '+5%' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '91~200', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+8%' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { rare: '+3%', epic: '+5%', unique: '+7%', legendary: '+9%' }, singleStatTemplates, { part: excludeWeaponPotentialParts }),
  ]),
  table('올스탯 고정치 증가', '002.md', [
    row('potential', '0~20', { rare: '+1' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '21~40', { rare: '+2' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '41~60', { rare: '+3' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '61~80', { rare: '+4' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '81~200', { rare: '+5' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '201~', { rare: '+6' }, '올스탯 {value}', { part: allPotentialParts }),
    row('additional', '0~20', { rare: '+1' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '21~40', { rare: '+2' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '41~60', { rare: '+3' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '61~80', { rare: '+4' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '81~200', { rare: '+5' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '201~', { rare: '+6' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '0~50', { rare: '+1' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '51~90', { rare: '+2' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '91~200', { rare: '+3' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { rare: '+4' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
  ]),
  table('올스탯 % 증가', '002.md', [
    row('potential', '0~30', { epic: '+1%', unique: '+2%', legendary: '+3%' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '31~70', { epic: '+2%', unique: '+4%', legendary: '+6%' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '71~200', { epic: '+3%', unique: '+6%', legendary: '+9%' }, '올스탯 {value}', { part: allPotentialParts }),
    row('potential', '201~', { epic: '+4%', unique: '+7%', legendary: '+10%' }, '올스탯 {value}', { part: allPotentialParts }),
    row('additional', '0~30', { epic: '+1%', unique: '+2%', legendary: '+3%' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '31~70', { epic: '+2%', unique: '+4%', legendary: '+6%' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '71~200', { epic: '+3%', unique: '+6%', legendary: '+9%' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '201~', { epic: '+4%', unique: '+7%', legendary: '+10%' }, '올스탯 {value}', { part: weaponPotentialParts }),
    row('additional', '0~20', { epic: '+1%', unique: '+1%', legendary: '+2%' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '21~50', { epic: '+1%', unique: '+2%', legendary: '+3%' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '51~90', { epic: '+1%', unique: '+3%', legendary: '+4%' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '91~200', { epic: '+2%', unique: '+5%', legendary: '+6%' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { epic: '+3%', unique: '+6%', legendary: '+7%' }, '올스탯 {value}', { part: excludeWeaponPotentialParts }),
  ]),
  table('HP/MP 고정치 증가', '002.md', [
    row('potential', '0~10', { normal: '+5', rare: '+10' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '11~20', { normal: '+10', rare: '+20' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '21~30', { normal: '+15', rare: '+30' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '31~40', { normal: '+20', rare: '+40' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '41~50', { normal: '+25', rare: '+50' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '51~60', { normal: '+30', rare: '+60' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '61~70', { normal: '+35', rare: '+70' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '71~80', { normal: '+40', rare: '+80' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '81~90', { normal: '+45', rare: '+90' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '91~100', { normal: '+50', rare: '+100' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '101~110', { normal: '+55', rare: '+110' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '111~200', { normal: '+60', rare: '+120' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '201~', { normal: '+60', rare: '+125' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '0~10', { normal: '+5', rare: '+10' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '11~20', { normal: '+10', rare: '+10' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '21~30', { normal: '+15', rare: '+10' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '31~40', { normal: '+20', rare: '+15' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '41~50', { normal: '+25', rare: '+15' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '51~60', { normal: '+30', rare: '+15' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '61~70', { normal: '+35', rare: '+50' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '71~80', { normal: '+40', rare: '+50' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '81~90', { normal: '+45', rare: '+50' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '91~100', { normal: '+50', rare: '+50' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '101~110', { normal: '+55', rare: '+100' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '111~200', { normal: '+60', rare: '+100' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '201~', { normal: '+60', rare: '+125' }, maxHpMpTemplates, { part: weaponPotentialParts }),
    row('additional', '0~10', { normal: '+5', rare: '+10', epic: '+15', unique: '+20', legendary: '+25' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '11~20', { normal: '+10', rare: '+10', epic: '+30', unique: '+40', legendary: '+50' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '21~30', { normal: '+15', rare: '+10', epic: '+45', unique: '+60', legendary: '+75' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '31~40', { normal: '+20', rare: '+15', epic: '+60', unique: '+80', legendary: '+100' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '41~50', { normal: '+25', rare: '+15', epic: '+75', unique: '+100', legendary: '+125' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '51~60', { normal: '+30', rare: '+15', epic: '+90', unique: '+120', legendary: '+150' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '61~70', { normal: '+35', rare: '+50', epic: '+105', unique: '+140', legendary: '+175' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '71~80', { normal: '+40', rare: '+50', epic: '+120', unique: '+160', legendary: '+200' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '81~90', { normal: '+45', rare: '+50', epic: '+135', unique: '+180', legendary: '+225' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '91~100', { normal: '+50', rare: '+50', epic: '+150', unique: '+300', legendary: '+360' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '101~110', { normal: '+55', rare: '+100', epic: '+165', unique: '+300', legendary: '+360' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '111~200', { normal: '+60', rare: '+100', epic: '+180', unique: '+300', legendary: '+360' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { normal: '+60', rare: '+125', epic: '+195', unique: '+315', legendary: '+375' }, maxHpMpTemplates, { part: excludeWeaponPotentialParts }),
  ]),
  table('HP/MP % 증가', '002.md', [
    row('potential', '0~30', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+6%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '31~70', { rare: '+2%', epic: '+4%', unique: '+6%', legendary: '+9%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '71~200', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('potential', '201~', { rare: '+4%', epic: '+7%', unique: '+10%', legendary: '+13%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '0~20', { rare: '+1%', epic: '+1%', unique: '+2%', legendary: '+3%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '21~50', { rare: '+1%', epic: '+2%', unique: '+3%', legendary: '+5%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '51~90', { rare: '+1%', epic: '+3%', unique: '+5%', legendary: '+7%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '91~200', { rare: '+2%', epic: '+5%', unique: '+8%', legendary: '+11%' }, maxHpMpTemplates, { part: allPotentialParts }),
    row('additional', '201~', { rare: '+3%', epic: '+6%', unique: '+9%', legendary: '+12%' }, maxHpMpTemplates, { part: allPotentialParts }),
  ]),
  table('방어력 고정치 증가', '003.md', [
    row('potential', '0~10', { normal: '+5', rare: '+10' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '11~20', { normal: '+10', rare: '+20' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '21~30', { normal: '+15', rare: '+30' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '31~40', { normal: '+20', rare: '+40' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '41~50', { normal: '+25', rare: '+50' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '51~60', { normal: '+30', rare: '+60' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '61~70', { normal: '+35', rare: '+70' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '71~80', { normal: '+40', rare: '+80' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '81~90', { normal: '+45', rare: '+90' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '91~100', { normal: '+50', rare: '+100' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '101~110', { normal: '+55', rare: '+110' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '111~200', { normal: '+60', rare: '+120' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('potential', '201~', { normal: '+60', rare: '+125' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '0~10', { normal: '+5', rare: '+10' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '11~20', { normal: '+10', rare: '+10' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '21~30', { normal: '+15', rare: '+10' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '31~40', { normal: '+20', rare: '+15' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '41~50', { normal: '+25', rare: '+15' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '51~60', { normal: '+30', rare: '+15' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '61~70', { normal: '+35', rare: '+50' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '71~80', { normal: '+40', rare: '+50' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '81~90', { normal: '+45', rare: '+50' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '91~100', { normal: '+50', rare: '+50' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '101~110', { normal: '+55', rare: '+100' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '111~200', { normal: '+60', rare: '+100' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '201~', { normal: '+60', rare: '+125' }, '방어력 {value}', { part: weaponPotentialParts }),
    row('additional', '0~10', { normal: '+5', rare: '+10', epic: '+15' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '11~20', { normal: '+10', rare: '+10', epic: '+15' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '21~30', { normal: '+15', rare: '+10', epic: '+15' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '31~40', { normal: '+20', rare: '+15', epic: '+20' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '41~50', { normal: '+25', rare: '+15', epic: '+20' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '51~60', { normal: '+30', rare: '+15', epic: '+20' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '61~70', { normal: '+35', rare: '+50', epic: '+60' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '71~80', { normal: '+40', rare: '+50', epic: '+60' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '81~90', { normal: '+45', rare: '+50', epic: '+60' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '91~100', { normal: '+50', rare: '+50', epic: '+60' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '101~110', { normal: '+55', rare: '+100', epic: '+120' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '111~200', { normal: '+60', rare: '+100', epic: '+120' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { normal: '+60', rare: '+125', epic: '+150' }, '방어력 {value}', { part: excludeWeaponPotentialParts }),
  ]),
  table('방어력 % 증가', '003.md', [
    row('potential', '0~30', { rare: '+1%', epic: '+2%' }, '방어력 {value}'),
    row('potential', '31~70', { rare: '+2%', epic: '+4%' }, '방어력 {value}'),
    row('potential', '71~200', { rare: '+3%', epic: '+6%' }, '방어력 {value}'),
    row('potential', '201~', { rare: '+4%', epic: '+7%' }, '방어력 {value}'),
    row('additional', '0~20', { rare: '+1%', epic: '+1%' }, '방어력 {value}'),
    row('additional', '21~30', { rare: '+1%', epic: '+1%' }, '방어력 {value}'),
    row('additional', '31~50', { rare: '+1%', epic: '+2%' }, '방어력 {value}'),
    row('additional', '51~70', { rare: '+1%', epic: '+2%' }, '방어력 {value}'),
    row('additional', '71~90', { rare: '+1%', epic: '+4%' }, '방어력 {value}'),
    row('additional', '91~200', { rare: '+2%', epic: '+4%' }, '방어력 {value}'),
    row('additional', '201~', { rare: '+3%', epic: '+5%' }, '방어력 {value}'),
  ], { part: excludeWeaponPotentialParts }),
  table('HP 회복 아이템 및 회복 스킬 효율', '003.md', [
    row('potential', '0~30', { unique: '10%' }, 'HP 회복 아이템 및 회복 스킬 효율 +{value}'),
    row('potential', '31~70', { unique: '20%' }, 'HP 회복 아이템 및 회복 스킬 효율 +{value}'),
    row('potential', '71~', { unique: '30%' }, 'HP 회복 아이템 및 회복 스킬 효율 +{value}'),
  ], { part: excludeWeaponPotentialParts }),
  table('피격 시 감정', '003.md', [
    row(
      'potential',
      '0~',
      {
        normal: [
          '피격 시 10% 확률로 10초간 분노를 느낀다',
          '피격 시 10% 확률로 10초간 행복을 느낀다',
          '피격 시 10% 확률로 10초간 사랑에 빠진다',
          '피격 시 10% 확률로 10초간 격노를 느낀다',
          '피격 시 10% 확률로 10초간 감동을 느낀다',
        ],
      },
      '{value}',
    ),
  ], { part: armorPotentialParts }),
  table('모든 스킬의 재사용 대기시간 감소', '003.md', [
    row('potential', '70~', { legendary: '-1초' }, '스킬 재사용 대기시간 {value}'),
    row('potential', '120~', { legendary: ['-1초', '-2초'] }, '스킬 재사용 대기시간 {value}'),
    row('additional', '100~', { legendary: '-1초' }, '스킬 재사용 대기시간 {value}'),
  ], { part: hatPotentialParts }),
  table('피격 후 무적시간', '003.md', [row('potential', '0~', { epic: '+1초', unique: '+2초', legendary: '+3초' }, '피격 후 무적시간 {value}')], { part: topOverallPotentialParts }),
  table('피격 시 무적', '003.md', [
    damageChanceRow('0~40', { unique: ['2%', '5초'], legendary: ['4%', '5초'] }, '피격 시 {chance} 확률로 {value}간 무적'),
    damageChanceRow('41~80', { unique: ['2%', '6초'], legendary: ['4%', '6초'] }, '피격 시 {chance} 확률로 {value}간 무적'),
    damageChanceRow('81~', { unique: ['2%', '7초'], legendary: ['4%', '7초'] }, '피격 시 {chance} 확률로 {value}간 무적'),
  ], { part: topOverallPotentialParts }),
  table('피격 시 고정 데미지 무시', '003.md', [
    flatDamageIgnoreRow('0~10', [3, 5, 7]),
    flatDamageIgnoreRow('11~20', [5, 8, 11]),
    flatDamageIgnoreRow('21~30', [7, 11, 15]),
    flatDamageIgnoreRow('31~40', [9, 14, 19]),
    flatDamageIgnoreRow('41~50', [11, 17, 23]),
    flatDamageIgnoreRow('51~60', [13, 20, 27]),
    flatDamageIgnoreRow('61~70', [15, 23, 31]),
    flatDamageIgnoreRow('71~80', [17, 26, 35]),
    flatDamageIgnoreRow('81~90', [19, 29, 39]),
    flatDamageIgnoreRow('91~100', [21, 32, 43]),
    flatDamageIgnoreRow('101~110', [23, 35, 47]),
    flatDamageIgnoreRow('111~200', [25, 38, 51]),
    flatDamageIgnoreRow('201~', [26, 39, 53]),
  ], { part: subWeaponArmorBeltShoulderPotentialParts }),
  table('피격 시 비율 데미지 무시', '003.md', [
    damageChanceRow('20~', { unique: ['5%', '20%'], legendary: ['10%', '20%'] }, '피격 시 {chance} 확률로 데미지의 {value} 무시'),
    damageChanceRow('40~', { unique: ['5%', '40%'], legendary: ['10%', '40%'] }, '피격 시 {chance} 확률로 데미지의 {value} 무시'),
  ], { part: armorPotentialParts }),
  table('피해 반사', '004.md', [
    reflectDamageRow('0~30', '10%', ['20%', '30%']),
    reflectDamageRow('31~70', '10%', ['35%', '50%']),
    reflectDamageRow('71~100', '20%', ['50%', '70%']),
    reflectDamageRow('101~200', '30%', ['50%', '70%']),
    reflectDamageRow('250~', '35%', ['50%', '70%']),
  ], { part: topBottomOverallPotentialParts }),
  table('오토스틸', '004.md', [
    row('potential', '20~', { unique: '1%', legendary: '3%' }, '공격 시 {value} 확률로 오토스틸'),
    row('potential', '40~', { unique: '2%', legendary: '5%' }, '공격 시 {value} 확률로 오토스틸'),
    row('potential', '60~', { unique: '2%', legendary: '7%' }, '공격 시 {value} 확률로 오토스틸'),
  ], { part: glovesPotentialParts }),
  table('단일 스탯 +32', '004.md', [row('potential', '30~', { unique: '+32' }, singleStatTemplates)], { part: glovesPotentialParts }),
  table('캐릭터 기준 9레벨당 스탯 고정치 증가', '004.md', [row('additional', '0~', { unique: '+1', legendary: '+2' }, singleStatTemplates.map((template) => `캐릭터 기준 9레벨 당 ${template}`))], { part: allPotentialParts }),
  table('크리티컬 데미지 증가', '004.md', [
    row('potential', '50~60', { legendary: '+5%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('potential', '70~80', { legendary: '+6%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('potential', '90~', { legendary: '+8%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('additional', '0~20', { legendary: '+1%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('additional', '21~90', { legendary: '+2%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('additional', '91~', { legendary: '+3%' }, '크리티컬 데미지 {value}', { part: glovesPotentialParts }),
    row('additional', '0~', { legendary: '+1%' }, '크리티컬 데미지 {value}', { part: armorBeltShoulderWithoutGlovesPotentialParts }),
  ]),
  table('이동속도/점프력 증가', '004.md', [
    row('potential', '0~30', { normal: '+1', rare: '+2' }, speedJumpTemplates, { part: shoesPotentialParts }),
    row('potential', '31~70', { normal: '+2', rare: '+4' }, speedJumpTemplates, { part: shoesPotentialParts }),
    row('potential', '71~110', { normal: '+3', rare: '+6' }, speedJumpTemplates, { part: shoesPotentialParts }),
    row('potential', '111~200', { normal: '+4', rare: '+8' }, speedJumpTemplates, { part: shoesPotentialParts }),
    row('potential', '201~', { normal: '+4', rare: '+9' }, speedJumpTemplates, { part: shoesPotentialParts }),
    row('additional', '0~20', { rare: '+2', epic: '+4' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '21~30', { rare: '+3', epic: '+4' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '31~50', { rare: '+3', epic: '+6' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '51~80', { rare: '+4', epic: '+6' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '81~110', { rare: '+5', epic: '+6' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '111~200', { rare: '+6', epic: '+8' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
    row('additional', '201~', { rare: '+6', epic: '+9' }, speedJumpTemplates, { part: excludeWeaponPotentialParts }),
  ]),
  table('4초 당 HP/MP 회복', '004.md', [
    row('potential', '0~14', { rare: '2' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '15~24', { rare: '4' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '25~34', { rare: '6' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '35~44', { rare: '8' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '45~54', { rare: '10' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '55~64', { rare: '12' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '65~74', { rare: '14' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '75~84', { rare: '16' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '85~94', { rare: '18' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '95~104', { rare: '20' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '105~114', { rare: '22' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '115~200', { rare: '24' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
    row('potential', '201~', { rare: '25' }, ['4초 당 {value}의 HP 회복', '4초 당 {value}의 MP 회복']),
  ], { part: accessoryPotentialParts }),
  table('아이템 드롭률 증가/메소 획득량 증가', '004.md', [
    row('potential', '0~30', { legendary: '+10%' }, dropMesoTemplates),
    row('potential', '31~70', { legendary: '+15%' }, dropMesoTemplates),
    row('potential', '71~', { legendary: '+20%' }, dropMesoTemplates),
    row('additional', '0~19', { legendary: '+2%' }, dropMesoTemplates),
    row('additional', '30~60', { legendary: '+3%' }, dropMesoTemplates),
    row('additional', '70~90', { legendary: '+4%' }, dropMesoTemplates),
    row('additional', '100~', { legendary: '+5%' }, dropMesoTemplates),
  ], { part: accessoryPotentialParts }),
  table('모든 스킬의 MP 소모 감소', '004.md', [
    row('potential', '0~50', { legendary: ['-5%', '-10%'] }, '모든 스킬의 MP 소모 {value}'),
    row('potential', '51~100', { legendary: ['-10%', '-20%'] }, '모든 스킬의 MP 소모 {value}'),
    row('potential', '110~', { legendary: ['-15%', '-30%'] }, '모든 스킬의 MP 소모 {value}'),
  ], { part: accessoryPotentialParts }),
  table('쓸만한 스킬', '004.md', [
    row('potential', '70~', { unique: '<쓸만한 미스틱 도어> 스킬 사용 가능' }, '{value}', { part: hatPotentialParts }),
    row('potential', '120~', { legendary: '<쓸만한 어드밴스드 블레스> 스킬 사용 가능' }, '{value}', { part: hatPotentialParts }),
    row('potential', '70~', { unique: '<쓸만한 하이퍼 바디> 스킬 사용 가능' }, '{value}', { part: bottomPotentialParts }),
    row('potential', '120~', { unique: '<쓸만한 샤프 아이즈> 스킬 사용 가능' }, '{value}', { part: glovesPotentialParts }),
    row('potential', '120~', { legendary: '<쓸만한 윈드 부스터> 스킬 사용 가능' }, '{value}', { part: glovesPotentialParts }),
    row('potential', '70~', { unique: '<쓸만한 헤이스트> 스킬 사용 가능' }, '{value}', { part: shoesPotentialParts }),
    row('potential', '80~', { legendary: '<쓸만한 컴뱃 오더스> 스킬 사용 가능' }, '{value}', { part: shoesPotentialParts }),
  ]),
] as const satisfies readonly PotentialOptionGradeTable[];

const optionGradeTextMapByLevelCache = new Map<string, PotentialOptionGradeTextMap>();

export function getPotentialOptionGradeTextMapByLevel(level: number, kind?: PotentialOptionGradeKind, part?: string): PotentialOptionGradeTextMap {
  const cacheKey = `${kind ?? 'all'}:${level}:${part ?? 'all-parts'}`;
  const cached = optionGradeTextMapByLevelCache.get(cacheKey);
  if (cached) return cached;

  const map: Record<string, PotentialGrade[]> = {};

  for (const currentTable of potentialOptionGradeTables) {
    for (const currentRow of currentTable.rows) {
      if (!isPotentialOptionLevelInRange(level, currentRow.levelRange)) continue;
      if (kind && currentRow.kind !== kind) continue;
      if (part && !isPotentialOptionPartMatched(part, currentRow.part ?? currentTable.part)) continue;

      for (const grade of potentialGradeOrder) {
        for (const optionText of currentRow[grade] ?? []) {
          map[optionText] = mergeGrades(map[optionText] ?? [], grade);
        }
      }
    }
  }

  optionGradeTextMapByLevelCache.set(cacheKey, map);

  return map;
}

export function findPotentialOptionGrades(level: number, optionText: string, kind?: PotentialOptionGradeKind, part?: string): readonly PotentialGrade[] {
  return getPotentialOptionGradeTextMapByLevel(level, kind, part)[optionText] ?? [];
}

export function findPotentialOptionGrade(level: number, optionText: string, kind?: PotentialOptionGradeKind, part?: string): PotentialGrade | undefined {
  const grades = findPotentialOptionGrades(level, optionText, kind, part);

  return grades.reduce<PotentialGrade | undefined>((bestGrade, currentGrade) => {
    if (bestGrade == null) return currentGrade;

    return potentialGradeRankMap[currentGrade] > potentialGradeRankMap[bestGrade] ? currentGrade : bestGrade;
  }, undefined);
}

export function isPotentialOptionPartMatched(part: string, condition?: PotentialOptionGradePartCondition): boolean {
  if (condition == null) return true;

  if (condition.include != null) {
    return condition.include.includes('all') || condition.include.includes(part);
  }

  return !condition.exclude.includes(part);
}

export function createEmptyPotentialOptionTextsByLevelGradeScope(levels: readonly number[]): PotentialOptionTextsByLevelGradeScope {
  const byLevel: PotentialOptionTextsByLevelGradeScope = {};

  for (const level of levels) {
    byLevel[String(level)] = {
      normal: createEmptyPotentialOptionTextsByScope(),
      rare: createEmptyPotentialOptionTextsByScope(),
      epic: createEmptyPotentialOptionTextsByScope(),
      unique: createEmptyPotentialOptionTextsByScope(),
      legendary: createEmptyPotentialOptionTextsByScope(),
    };
  }

  return byLevel;
}

function createEmptyPotentialOptionTextsByScope() {
  return Object.fromEntries(potentialOptionScopes.map((scope) => [scope, []])) as unknown as PotentialOptionTextsByLevelGradeScope[string][PotentialGrade];
}

function mergeGrades(grades: readonly PotentialGrade[], grade: PotentialGrade): PotentialGrade[] {
  if (grades.includes(grade)) return [...grades];

  return [...grades, grade].sort((a, b) => potentialGradeRankMap[a] - potentialGradeRankMap[b]);
}

function withAdditionalRows(rows: readonly PotentialOptionGradeRow[]): PotentialOptionGradeRow[] {
  return [
    ...rows,
    ...rows.map((currentRow) => ({
      ...currentRow,
      kind: 'additional' as const,
    })),
  ];
}

function statusDebuffRow(level: string, values: { poison: number; darkness: number; common: number }): PotentialOptionGradeRow {
  const rare = [
    ...createStatusDebuffTexts(['중독'], ['20%', '10%'], values.poison),
    ...createStatusDebuffTexts(['암흑'], ['20%', '10%'], values.darkness),
    ...createStatusDebuffTexts(['슬로우'], ['20%', '10%'], values.common),
    ...createStatusDebuffTexts(['기절', '빙결', '봉인'], ['10%', '5%'], values.common),
  ];

  return {
    kind: 'potential',
    level,
    levelRange: parsePotentialOptionLevelRange(level),
    rare,
  };
}

function createStatusDebuffTexts(statuses: readonly string[], chances: readonly string[], value: number): string[] {
  return statuses.flatMap((status) => chances.map((chance) => `공격 시 ${chance} 확률로 ${value}레벨의 ${status}효과 적용`));
}

function attackRecoveryRow(
  level: string,
  values: {
    hpCashRare: number;
    hpCashEpic: number;
    hpNormalRare: number;
    hpNormalEpic: number;
    mpCashRare: number;
    mpCashEpic: number;
    mpNormalRare: number;
    mpNormalEpic: number;
  },
): PotentialOptionGradeRow {
  return {
    kind: 'potential',
    level,
    levelRange: parsePotentialOptionLevelRange(level),
    rare: [
      `공격 시 3% 확률로 ${values.hpCashRare}의 HP 회복`,
      `공격 시 3% 확률로 ${values.hpNormalRare}의 HP 회복`,
      `공격 시 3% 확률로 ${values.mpCashRare}의 MP 회복`,
      `공격 시 3% 확률로 ${values.mpNormalRare}의 MP 회복`,
    ],
    epic: [
      `공격 시 20% 확률로 ${values.hpCashEpic}의 HP 회복`,
      `공격 시 20% 확률로 ${values.hpNormalEpic}의 HP 회복`,
      `공격 시 20% 확률로 ${values.mpCashEpic}의 MP 회복`,
      `공격 시 20% 확률로 ${values.mpNormalEpic}의 MP 회복`,
    ],
  };
}

function damageChanceRow(level: string, values: Partial<Record<PotentialGrade, readonly [string, string]>>, template: string): PotentialOptionGradeRow {
  const currentRow: Partial<PotentialOptionGradeRow> = {
    kind: 'potential',
    level,
    levelRange: parsePotentialOptionLevelRange(level),
  };

  for (const grade of potentialGradeOrder) {
    const value = values[grade];
    if (value == null) continue;

    const [chance, amount] = value;
    currentRow[grade] = [template.replace('{chance}', chance).replace('{value}', amount)];
  }

  return currentRow as PotentialOptionGradeRow;
}

function flatDamageIgnoreRow(level: string, values: readonly [number, number, number]): PotentialOptionGradeRow {
  return {
    kind: 'potential',
    level,
    levelRange: parsePotentialOptionLevelRange(level),
    epic: [
      `피격 시 20% 확률로 ${values[0]}의 데미지 무시`,
      `피격 시 20% 확률로 ${values[1]}의 데미지 무시`,
      `피격 시 30% 확률로 ${values[2]}의 데미지 무시`,
    ],
  };
}

function reflectDamageRow(level: string, chance: string, values: readonly string[]): PotentialOptionGradeRow {
  return {
    kind: 'potential',
    level,
    levelRange: parsePotentialOptionLevelRange(level),
    unique: values.map((value) => `${chance} 확률로 받은 피해의 ${value}를 반사`),
  };
}
