import type { PhantomSkillName } from './skillName';

import type { SkillMeta } from '@/skill/types';

export const phantomSkillMeta = {
  '데들리 인스팅트': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '리턴 오브 팬텀': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '팬텀 슈라우드': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '스틸 스킬': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '스킬 매니지먼트': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  저지먼트: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '저지먼트 AUTO/MANUAL': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '하이 덱스터러티': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '더블 피어싱': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '탤런트 오브 팬텀시프 I': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '스위프트 팬텀': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '퀵 이베이젼': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '콜 오브 페이트': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '탤런트 오브 팬텀시프 II': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '브리즈 카르트': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '블랑 카르트': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'finalAttack' }],
  },
  '케인 엑셀레이션': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '케인 마스터리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '럭 모노폴리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '코트 오브 암즈': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '팬텀 차지': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
  },
  '탤런트 오브 팬텀시프 III': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '럭 오브 팬텀시프': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
    ],
  },
  '문 라이트': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '미스포츈 프로텍션': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '플래시 앤 플리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '어큐트 센스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '얼티밋 드라이브': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
  },
  '탤런트 오브 팬텀시프 IV': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '템페스트 오브 카드': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
  },
  트와일라이트: {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
  },
  '소울 스틸': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '프레이 오브 아리아': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '메이플 용사': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  '용사의 의지': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '느와르 카르트': {
    effects: [
      { activation: 'passive', combatKind: 'attack', kind: 'finalAttack' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
    ],
  },
  '케인 엑스퍼트': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '템페스트 오브 카드-리인포스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '템페스트 오브 카드-쿨타임 리듀스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '템페스트 오브 카드-엑스트라 타겟': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '얼티밋 드라이브-리인포스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '얼티밋 드라이브-엑스트라 타겟': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '얼티밋 드라이브-이그노어 가드': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '탤런트 오브 팬텀시프-리인포스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '탤런트 오브 팬텀시프-퍼시스트': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '탤런트 오브 팬텀시프-인핸스': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '탤런트 오브 팬텀시프 H': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
  '로즈 카르트 피날레': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'damageOverTime' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'summon' },
    ],
  },
  '히어로즈 오쓰': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },

  조커: {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
  },
  블랙잭: {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'projectile' }],
  },
  '마크 오브 팬텀': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
    ],
  },
  '리프트 브레이크': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '템페스트 오브 카드 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '얼티밋 드라이브/코트 오브 암즈/더블 피어싱 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '블랑 카르트 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '로즈 카르트 피날레/트와일라이트 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '팬텀 차지/브리즈 카르트/콜 오브 페이트 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '탤런트 오브 팬텀 시프 I~IV 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },

  '템페스트 오브 카드 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
  },
  '얼티밋 드라이브 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
  },
  '느와르 카르트 VI': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'finalAttack' }],
  },
  '로즈 카르트 피날레 VI': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'damageOverTime' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'summon' },
    ],
  },
  '라모르 카르트': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
  },
  '조커 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '블랙잭 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '마크 오브 팬텀 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '리프트 브레이크 강화': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  },
  '디파잉 페이트': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
  },
  '문리트 세레나데': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
  },
} as const satisfies Record<PhantomSkillName, SkillMeta<PhantomSkillName>>;
