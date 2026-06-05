import type { BishopSkillName } from './skillName';

import { hexamatrixEnhanceCore, hyperPassiveSkill, meta, vmatrixEnhanceCore } from '@/skill/types';
import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';

const m = meta.of<BishopSkillName>();

export const bishopSkillMeta = {
  '임피리컬 널리지': m.level({
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'debuff' }],
  }),
  '에너지 볼트': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  텔레포트: m.level(5, {
    effects: ['activeMovement'],
  }),
  '마나 웨이브': m.level(1, {
    effects: ['activeMovement'],
  }),
  '매직 가드': m.level(10, {
    effects: ['passiveBuff'],
  }),
  '매직 아머': m.level(9, {
    effects: ['passiveStat'],
  }),
  'MP 증가': m.level(20, {
    effects: ['passiveStat'],
  }),
  '홀리 애로우': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  '블레싱 앙상블': m.level(1, {
    initialLevel: 1,
    effects: ['passiveStat'],
  }),
  힐: m.level(20, {
    tags: ['자애'],
    effects: ['activeHeal'],
  }),
  '엔젤릭 터치': m.level('힐', {
    tags: ['복수'],
    effects: ['activeAttackInstant', 'activeDebuff'],
  }),
  블레스: m.level(10, {
    requiredSkill: [{ name: '인빈서블', level: 5 }],
    effects: ['activeBuff'],
  }),
  '매직 액셀레이션': m.level(10, {
    effects: ['passiveStat'],
  }),
  인빈서블: m.level(10, {
    requiredSkill: [{ name: '힐', level: 5 }],
    effects: ['passiveStat'],
  }),
  '스펠 마스터리': m.level(10, {
    effects: ['passiveStat'],
  }),
  '하이 위즈덤': m.level(5, {
    effects: ['passiveStat'],
  }),
  'MP 이터': m.level(9, {
    requiredSkill: [{ name: '스펠 마스터리', level: 5 }],
    effects: ['passiveStat'],
  }),
  '샤이닝 레이': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  '홀리 파운틴': m.level(10, {
    tags: ['자애'],
    effects: ['activeSummon', 'activeHeal'],
  }),
  '파운틴 포 엔젤': m.level('홀리 파운틴', {
    tags: ['복수'],
    effects: ['activeAttackSummon'],
  }),
  '디바인 프로텍션': m.level(10, {
    effects: ['activeBuff', 'passiveStat'],
  }),
  '미스틱 도어': m.level(9, {
    requiredSkill: [{ name: '디스펠', level: 3 }],
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'mapTeleport' }],
  }),
  디스펠: m.level(10, {
    tags: ['자애'],
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'statusCleanse' }],
  }),
  '트라이엄프 페더': m.level('디스펠', {
    tags: ['복수'],
    effects: ['activeBuff', 'passiveAttackProjectile'],
  }),
  '홀리 심볼': m.level(20, {
    requiredSkill: [{ name: '디스펠', level: 3 }],
    effects: ['activeBuff'],
  }),
  '텔레포트 마스터리': m.level(10, {
    requiredSkill: [{ name: '텔레포트', level: 5 }],
    effects: ['activeToggle', 'passiveStat'],
  }),
  '텔레포트 부스트': m.level(1, {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' }],
  }),
  '홀리 매직쉘': m.level(20, {
    effects: ['activeHeal', 'activeBuff', { activation: 'active', combatKind: 'nonAttack', kind: 'defense' }],
  }),
  '매직 크리티컬': m.level(10, {
    effects: ['passiveStat'],
  }),
  '홀리 포커스': m.level(4, {
    requiredSkill: [{ name: '스펠 마스터리', level: 10 }],
    effects: ['passiveStat'],
  }),
  엔젤레이: m.level(30, {
    isCombatOrders: true,
    effects: ['activeAttackInstant', 'activeHeal'],
  }),
  제네시스: m.level(30, {
    isCombatOrders: true,
    effects: ['activeAttackInstant'],
  }),
  '제네시스-파이널 어택': m.level('제네시스', {
    isInternal: true,
    effects: ['passiveFinalAttack'],
  }),
  빅뱅: m.level(30, {
    isCombatOrders: true,
    effects: ['activeAttackInstant', 'passiveSkillEnhance'],
  }),
  '블레싱 하모니': m.level(1, {
    initialLevel: 1,
    effects: ['passiveStat'],
  }),
  '홀리 워터': m.level(10, {
    tags: ['자애'],
    isCombatOrders: true,
    effects: ['activeSummon', 'activeHeal'],
  }),
  '홀리 블러드': m.level('홀리 워터', {
    tags: ['복수'],
    effects: ['activeBuff'],
  }),
  리저렉션: m.level(10, {
    isCombatOrders: true,
    effects: ['activeBuff', 'activeRevive'],
  }),
  인피니티: m.level(30, {
    isCombatOrders: true,
    effects: ['passiveStat'],
  }),
  바하뮤트: m.level(20, {
    isCombatOrders: true,
    effects: ['activeAttackSummon'],
  }),
  '어드밴스드 블레스': m.level(20, {
    isCombatOrders: true,
    requiredSkill: [{ name: '블레스', level: 10 }],
    effects: ['activeBuff'],
  }),
  '메이플 용사': m.level(30, {
    isCombatOrders: true,
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'effect' }, 'passiveStat'],
  }),
  '용사의 의지': m.level(5, {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'statusCleanse' }],
  }),
  '마스터 매직': m.level(10, {
    effects: ['passiveStat'],
  }),
  '아케인 에임': m.level(30, {
    effects: ['passiveStat'],
  }),
  '홀리 매직쉘-엑스트라 가드': hyperPassiveSkill,
  '홀리 매직쉘-퍼시스트': hyperPassiveSkill,
  '홀리 매직쉘-인핸스': hyperPassiveSkill,
  '홀리 심볼-익스피리언스': hyperPassiveSkill,
  '홀리 심볼-임뷰 바디': hyperPassiveSkill,
  '홀리 심볼-엑스트라 드롭': hyperPassiveSkill,
  '어드밴스드 블레스-보너스 데미지': hyperPassiveSkill,
  '어드밴스드 블레스-보스 킬러': hyperPassiveSkill,
  '어드밴스드 블레스-엑스트라 포인트': hyperPassiveSkill,
  '벤전스 오브 엔젤': m.level(1, {
    effects: ['activeToggle', 'passiveStat'],
  }),
  '헤븐즈 도어': m.level(1, {
    effects: ['activeRevive'],
  }),
  '에픽 어드벤쳐': m.level(1, {
    effects: ['activeBuff'],
  }),
  프레이: m.level(30, {
    effects: ['activeBuff'],
  }),
  '엔젤 오브 리브라': m.level(30, {
    effects: ['activeBuff'],
  }),
  '엔젤 오브 리브라-자애의 천사': m.level('엔젤 오브 리브라', {
    isInternal: true,
    effects: ['passiveBuff', 'passiveHeal'],
  }),
  '엔젤 오브 리브라-복수의 천사': m.level('엔젤 오브 리브라', {
    isInternal: true,
    effects: ['passiveAttackSummon'],
  }),
  피스메이커: m.level(30, {
    effects: ['activeAttackProjectile', 'activeHeal'],
  }),
  '피스메이커-신성한 빛': m.level('피스메이커', {
    isInternal: true,
    effects: ['passiveAttackTriggered', 'passiveBuff'],
  }),
  '디바인 퍼니시먼트': m.level(30, {
    tags: ['성검'],
    effects: ['activeAttackKeyDown'],
    desc: '최대 5스택 / 1스택당 리피트히트 10',
  }),
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
  '엔젤레이 VI': m.level(30, {
    tags: ['성검'],
    effects: ['activeAttackInstant', 'activeHeal'],
    requiredSkill: [{ name: '엔젤레이', level: 30 }],
  }),
  '엔젤레이 VI-심판의 천사': m.level('엔젤레이 VI', {
    isInternal: true,
    effects: ['passiveAttackTriggered'],
  }),
  '빅뱅 VI': m.level(30, {
    effects: ['activeAttackInstant'],
    requiredSkill: [{ name: '빅뱅', level: 30 }],
  }),
  '빅뱅 VI-신성 폭발': m.level('빅뱅 VI', {
    isInternal: true,
    effects: ['activeAttackReplace', 'passiveSkillEnhance'],
  }),
  '트라이엄프 페더 VI': m.level('빅뱅 VI', {
    tags: ['복수'],
    effects: ['activeBuff', 'passiveAttackProjectile'],
    requiredSkill: [{ name: '디스펠', level: 10 }],
  }),
  '엔젤릭 터치 VI': m.level(30, {
    tags: ['복수'],
    effects: ['activeAttackInstant', 'activeDebuff'],
    requiredSkill: [{ name: '힐', level: 20 }],
  }),
  '파운틴 포 엔젤 VI': m.level('엔젤릭 터치 VI', {
    tags: ['복수'],
    effects: ['activeAttackSummon'],
    requiredSkill: [{ name: '홀리 파운틴', level: 10 }],
  }),
  '바하뮤트 VI': m.level('엔젤릭 터치 VI', {
    effects: ['activeAttackSummon', 'passiveSkillEnhance'],
    requiredSkill: [{ name: '바하뮤트', level: 20 }],
  }),
  '제네시스 VI': m.level(30, {
    effects: ['activeAttackInstant'],
    requiredSkill: [{ name: '제네시스', level: 30 }],
  }),
  '제네시스 VI-파이널 어택': m.level('제네시스 VI', {
    isInternal: true,
    effects: ['passiveFinalAttack'],
  }),
  '헤븐즈 도어 VI': m.level('제네시스 VI', {
    effects: ['activeAttackInstant', 'activeRevive'],
  }),
  '프레이 강화': hexamatrixEnhanceCore.extend({
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  }),
  '엔젤 오브 리브라 강화': hexamatrixEnhanceCore,
  '피스메이커 강화': hexamatrixEnhanceCore,
  '디바인 퍼니시먼트 강화': hexamatrixEnhanceCore,
  '홀리 어드밴트': m.level(30, {
    isOrigin: true,
    effects: ['activeAttackInstant', 'activeSummon'],
  }),
  '홀리 어드밴트-균형의 대천사': m.level('홀리 어드밴트', {
    isInternal: true,
    effects: ['passiveAttackSummon'],
  }),
  '홀리 어드밴트-복수의 대천사': m.level('홀리 어드밴트', {
    isInternal: true,
    effects: ['passiveAttackSummon'],
  }),
  '홀리 어드밴트-자애의 대천사': m.level('홀리 어드밴트', {
    isInternal: true,
    effects: ['passiveAttackSummon'],
  }),
  '커맨드 오브 헤븐': m.level(30, {
    isAscent: true,
    effects: ['activeAttackInstant'],
  }),
} as const satisfies Record<BishopSkillName, SkillMeta<BishopSkillName>>;

export type BishopAttackSkillName = AttackSkillNameFromSkillMeta<typeof bishopSkillMeta>;
export type BishopActiveSkillName = ActiveSkillNameFromSkillMeta<typeof bishopSkillMeta>;
