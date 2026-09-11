import type { ClassGroupKey } from '@maple/data-class';
import type { LineageKey } from '@maple/data-core';

import type { FifthAdventurerClassGroupSkill, FifthClassGroupSkill, FifthLineageBlessingSkill, FifthLineageCommonSkill } from './core';

export const fifthLineageBlessingSkillMap: Record<LineageKey, readonly FifthLineageBlessingSkill[]> = {
  adventurer: ['메이플월드 여신의 축복'],
  cygnus: ['여제 시그너스의 축복', '초월자 시그너스의 축복'],
  heroes: ['메이플월드 여신의 축복'],
  resistance: ['메이플월드 여신의 축복'],
  demon: ['이계 여신의 축복'],
  nova: ['그란디스 여신의 축복'],
  transcendent: ['초월자 륀느의 기원'],
  friendsWorld: ['이계 여신의 축복'],
  lef: ['그란디스 여신의 축복'],
  anima: ['그란디스 여신의 축복'],
};

export const fifthLineageCommonSkillMap: Partial<Record<LineageKey, readonly FifthLineageCommonSkill[]>> = {
  cygnus: ['시그너스 팔랑크스'],
  heroes: ['프리드의 가호'],
  resistance: ['레지스탕스 라인 인팬트리'],
  demon: ['콜 마스테마'],
  nova: ['판테온'],
  transcendent: ['트랜센던트'],
  friendsWorld: ['이계의 잔상'],
  lef: ['매직 서킷 풀드라이브'],
  anima: ['화중군자'],
};

export const fifthAdventurerClassGroupSkillMap: Record<ClassGroupKey, readonly FifthAdventurerClassGroupSkill[]> = {
  warrior: ['블리츠 실드'],
  mage: ['아르카나 오버라이드'],
  archer: ['이볼브'],
  thief: ['얼티밋 다크 사이트'],
  pirate: ['파이렛 플래그'],
};

export const fifthClassGroupSkillMap: Record<ClassGroupKey, readonly FifthClassGroupSkill[]> = {
  warrior: ['오라 웨폰', '바디 오브 스틸'],
  mage: ['오버로드 마나', '에테리얼 폼'],
  archer: ['가이디드 애로우', '크리티컬 리인포스'],
  thief: ['베놈 버스트', '레디 투 다이'],
  pirate: ['로디드 다이스', '오버 드라이브'],
};
