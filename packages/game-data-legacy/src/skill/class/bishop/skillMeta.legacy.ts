import type { BishopSkillName } from './skillName';

import { hexamatrixEnhanceCore, hyperPassiveSkill, meta, vmatrixEnhanceCore } from '@/skill/types';
import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';

const m = meta.of<BishopSkillName>();

export const bishopSkillMeta = {
  '임피리컬 널리지': {
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'debuff',
      },
    ],
  },
  '에너지 볼트': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  텔레포트: {
    maxLevel: 5,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'movement',
      },
    ],
  },
  '마나 웨이브': {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'movement',
      },
    ],
  },
  '매직 가드': m.level(10, { effects: ['passiveBuff'] }),
  '매직 아머': m.level(9, { effects: ['passiveStat'] }),
  'MP 증가': m.level(20, { effects: ['passiveStat'] }),
  '홀리 애로우': m.level(20, { effects: ['activeAttackInstant'] }),
  '블레싱 앙상블': m.passiveStat(1).extend({
    initialLevel: 1,
  }),
  힐: m.activeHeal(20).extend({
    tags: ['자애'],
  }),
  '엔젤릭 터치': m.activeAttackInstant('힐').extend({
    tags: ['복수'],
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'debuff',
      },
    ],
  }),
  블레스: {
    maxLevel: 10,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    requiredSkill: [
      {
        name: '인빈서블',
        level: 5,
      },
    ],
  },
  '매직 액셀레이션': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  인빈서블: {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
    requiredSkill: [
      {
        name: '힐',
        level: 5,
      },
    ],
  },
  '스펠 마스터리': meta.passiveStat(10),
  '하이 위즈덤': meta.passiveStat(5),
  'MP 이터': m.passiveStat(9).extend({
    requiredSkill: [
      {
        name: '스펠 마스터리',
        level: 5,
      },
    ],
  }),
  '샤이닝 레이': m.activeAttackInstant(20),
  '홀리 파운틴': m.level(10, {
    tags: ['자애'],
    effects: ['activeSummon', 'activeHeal'],
  }),
  '파운틴 포 엔젤': m.level('홀리 파운틴', {
    tags: ['복수'],
    effects: ['activeAttackSummon'],
  }),
  '디바인 프로텍션': m.activeBuff(10).extend({
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  }),
  '미스틱 도어': {
    maxLevel: 9,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'mapTeleport',
      },
    ],
    requiredSkill: [
      {
        name: '디스펠',
        level: 3,
      },
    ],
  },
  디스펠: {
    maxLevel: 10,
    tags: ['자애'],
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'statusCleanse',
      },
    ],
  },
  '트라이엄프 페더': m.activeBuff('디스펠').extend({
    tags: ['복수'],
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'projectile' }],
  }),
  '홀리 심볼': {
    maxLevel: 20,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    requiredSkill: [
      {
        name: '디스펠',
        level: 3,
      },
    ],
  },
  '텔레포트 마스터리': {
    maxLevel: 10,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'toggle',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
    requiredSkill: [
      {
        name: '텔레포트',
        level: 5,
      },
    ],
  },
  '텔레포트 부스트': {
    maxLevel: 1,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
  },
  '홀리 매직쉘': {
    maxLevel: 20,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'defense',
      },
    ],
  },
  '매직 크리티컬': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '홀리 포커스': {
    maxLevel: 4,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
    requiredSkill: [
      {
        name: '스펠 마스터리',
        level: 10,
      },
    ],
  },
  엔젤레이: {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
    ],
    isCombatOrders: true,
  },
  제네시스: {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
    isCombatOrders: true,
  },
  '제네시스-파이널 어택': {
    levelSource: '제네시스',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'finalAttack',
      },
    ],
  },
  빅뱅: {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
    isCombatOrders: true,
  },
  '블레싱 하모니': {
    maxLevel: 1,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '홀리 워터': {
    maxLevel: 10,
    tags: ['자애'],
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'summon',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
    ],
  },
  '홀리 블러드': {
    levelSource: '홀리 워터',
    tags: ['복수'],
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  리저렉션: {
    maxLevel: 10,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'revive',
      },
    ],
  },
  인피니티: {
    maxLevel: 30,
    isCombatOrders: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  바하뮤트: {
    maxLevel: 20,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  '어드밴스드 블레스': {
    maxLevel: 20,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    requiredSkill: [
      {
        name: '블레스',
        level: 10,
      },
    ],
  },
  '메이플 용사': {
    maxLevel: 30,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'effect',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '용사의 의지': {
    maxLevel: 5,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'statusCleanse',
      },
    ],
  },
  '마스터 매직': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '아케인 에임': {
    maxLevel: 30,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '홀리 매직쉘-엑스트라 가드': hyperPassiveSkill,
  '홀리 매직쉘-퍼시스트': hyperPassiveSkill,
  '홀리 매직쉘-인핸스': hyperPassiveSkill,
  '홀리 심볼-익스피리언스': hyperPassiveSkill,
  '홀리 심볼-임뷰 바디': hyperPassiveSkill,
  '홀리 심볼-엑스트라 드롭': hyperPassiveSkill,
  '어드밴스드 블레스-보너스 데미지': hyperPassiveSkill,
  '어드밴스드 블레스-보스 킬러': hyperPassiveSkill,
  '어드밴스드 블레스-엑스트라 포인트': hyperPassiveSkill,
  '벤전스 오브 엔젤': {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'toggle',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '헤븐즈 도어': {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'revive',
      },
    ],
  },
  '에픽 어드벤쳐': {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  프레이: {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '엔젤 오브 리브라': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '엔젤 오브 리브라-자애의 천사': {
    levelSource: '엔젤 오브 리브라',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '엔젤 오브 리브라-복수의 천사': {
    levelSource: '엔젤 오브 리브라',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  피스메이커: {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'projectile',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
    ],
  },
  '피스메이커-신성한 빛': {
    levelSource: '피스메이커',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '디바인 퍼니시먼트': {
    maxLevel: 30,
    tags: ['성검'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'keyDown',
      },
    ],
    desc: '최대 5스택 / 1스택당 리피트히트 10',
  },
  '엔젤레이 강화': vmatrixEnhanceCore,
  '빅뱅 강화': vmatrixEnhanceCore,
  '트라이엄프 페더 강화': vmatrixEnhanceCore,
  '엔젤릭 터치 강화': vmatrixEnhanceCore,
  '파운틴 포 엔젤 강화': vmatrixEnhanceCore,
  '바하뮤트 강화': vmatrixEnhanceCore,
  '제네시스 강화': vmatrixEnhanceCore,
  '헤븐즈 도어 강화': vmatrixEnhanceCore,
  '샤이닝 레이 강화': vmatrixEnhanceCore,
  '홀리 애로우 강화': vmatrixEnhanceCore,
  '힐 강화': vmatrixEnhanceCore,
  '엔젤레이 VI': {
    maxLevel: 30,
    tags: ['성검'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'heal',
      },
    ],
    requiredSkill: [
      {
        name: '엔젤레이',
        level: 30,
      },
    ],
  },
  '엔젤레이 VI-심판의 천사': {
    levelSource: '엔젤레이 VI',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '빅뱅 VI': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
    requiredSkill: [
      {
        name: '빅뱅',
        level: 30,
      },
    ],
  },
  '빅뱅 VI-신성 폭발': {
    levelSource: '빅뱅 VI',
    isInternal: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'replace',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
  },
  '트라이엄프 페더 VI': {
    levelSource: '빅뱅 VI',
    tags: ['복수'],
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'projectile',
      },
    ],
    requiredSkill: [
      {
        name: '디스펠',
        level: 10,
      },
    ],
  },
  '엔젤릭 터치 VI': {
    maxLevel: 30,
    tags: ['복수'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'debuff',
      },
    ],
    requiredSkill: [
      {
        name: '힐',
        level: 20,
      },
    ],
  },
  '파운틴 포 엔젤 VI': {
    levelSource: '엔젤릭 터치 VI',
    tags: ['복수'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
    requiredSkill: [
      {
        name: '홀리 파운틴',
        level: 10,
      },
    ],
  },
  '바하뮤트 VI': {
    levelSource: '엔젤릭 터치 VI',
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
    requiredSkill: [
      {
        name: '바하뮤트',
        level: 20,
      },
    ],
  },
  '제네시스 VI': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '제네시스 VI-파이널 어택': {
    levelSource: '제네시스 VI',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'finalAttack',
      },
    ],
  },
  '헤븐즈 도어 VI': {
    levelSource: '제네시스 VI',
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'revive',
      },
    ],
  },
  '프레이 강화': hexamatrixEnhanceCore.extend({
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  }),
  '엔젤 오브 리브라 강화': hexamatrixEnhanceCore,
  '피스메이커 강화': hexamatrixEnhanceCore,
  '디바인 퍼니시먼트 강화': hexamatrixEnhanceCore,
  '홀리 어드밴트': {
    maxLevel: 30,
    isOrigin: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'summon',
      },
    ],
  },
  '홀리 어드밴트-균형의 대천사': {
    levelSource: '홀리 어드밴트',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  '홀리 어드밴트-복수의 대천사': {
    levelSource: '홀리 어드밴트',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  '홀리 어드밴트-자애의 대천사': {
    levelSource: '홀리 어드밴트',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  '커맨드 오브 헤븐': {
    maxLevel: 30,
    isAscent: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
} as const satisfies Record<BishopSkillName, SkillMeta<BishopSkillName>>;

export type BishopAttackSkillName = AttackSkillNameFromSkillMeta<typeof bishopSkillMeta>;
export type BishopActiveSkillName = ActiveSkillNameFromSkillMeta<typeof bishopSkillMeta>;
