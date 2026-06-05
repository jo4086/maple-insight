import type { ClassKey } from '@maple/data-core';

import { createSubWeaponPartMetaBuilder } from './builder';

import { subWeaponTypes, warriorFinalClasses, SubWeaponType } from '@/types';

export const subWeaponPartMetaMap = createSubWeaponPartMetaBuilder(subWeaponTypes)
  .add('medal', { label: '메달', requiredClassKeys: ['hero'] })
  .add('rosario', { label: '로자리오', requiredClassKeys: ['paladin'] })
  .add('shield', { label: '방패' })
  .add('chainIron', { label: '쇠사슬', requiredClassKeys: ['dark-knight'] })
  .add('grimoire', { label: '마도서', requiredClassKeys: ['arch-mage-fire-poison', 'arch-mage-ice-lightning', 'bishop'] })

  .add('arrowFeather', { label: '화살깃', requiredClassKeys: ['bow-master'] })
  .add('thumbRing', { label: '활골무', requiredClassKeys: ['marksman'] })
  .add('relic', { label: '렐릭', requiredClassKeys: ['pathfinder'] })

  .add('charm', { label: '부적', requiredClassKeys: ['night-lord'] })
  .add('daggerScabbard', { label: '단검용 검집', requiredClassKeys: ['shadower'] })
  .add('blade', { label: '블레이드', requiredClassKeys: ['dual-blader'] })

  .add('wristBand', { label: '리스트밴드', requiredClassKeys: ['viper'] })
  .add('sight', { label: '조준기', requiredClassKeys: ['captain'] })
  .add('powderKeg', { label: '화약통', requiredClassKeys: ['cannon-master'] })

  .add('jewel', { label: '보석', requiredClassKeys: ['soul-master', 'flame-wizard', 'wind-breaker', 'night-walker', 'striker'] })

  .add('weight', { label: '무게추', requiredClassKeys: ['aran'] })
  .add('document', { label: '문서', requiredClassKeys: ['evan'] })
  .add('orb', { label: '오브', requiredClassKeys: ['luminous'] })
  .add('magicArrow', { label: '마법화살', requiredClassKeys: ['mercedes'] })
  .add('card', { label: '카드', requiredClassKeys: ['phantom'] })
  .add('foxMarble', { label: '여우구슬', requiredClassKeys: ['eunwol'] })

  .add('magicMarble', { label: '마법구슬', requiredClassKeys: ['battle-mage'] })
  .add('arrowhead', { label: '화살촉', requiredClassKeys: ['wild-hunter'] })
  .add('controller', { label: '컨트롤러', requiredClassKeys: ['xenon'] })
  .add('magnum', { label: '매그넘', requiredClassKeys: ['mechanic'] })

  .add('novaEssence', { label: '노바의 정수', requiredClassKeys: ['kaiser'] })
  .add('soulRing', { label: '소울링', requiredClassKeys: ['angelic-buster'] })
  .add('chessPiece', { label: '체스피스', requiredClassKeys: ['kinesis'] })
  .add('charge', { label: '장약', requiredClassKeys: ['blaster'] })

  .add('weaponTransmitter', { label: '무기 전송장치', requiredClassKeys: ['cadena'] })
  .add('magicWing', { label: '매직 윙', requiredClassKeys: ['illium'] })
  .add('pass', { label: '패스', requiredClassKeys: ['ark'] })
  .add('ballast', { label: '선추', requiredClassKeys: ['hoyoung'] })

  .add('bracelet', { label: '브레이슬릿', requiredClassKeys: ['adele'] })
  .add('forceShield', { label: '포스실드', requiredClassKeys: ['demon-slayer', 'demon-avenger'] })
  .add('soulShield', { label: '소울실드', requiredClassKeys: ['mikhail'] })
  .add('weaponBelt', { label: '웨폰벨트', requiredClassKeys: ['kain'] })

  .add('norigae', { label: '노리개', requiredClassKeys: ['lara'] })
  .add('seonchu', { label: '선추', requiredClassKeys: ['hoyoung'] })
  .add('hexSeeker', { label: '헥스시커', requiredClassKeys: ['khali'] })
  .add('yeouiju', { label: '여의보주', requiredClassKeys: ['len'] })
  .add('hourglass', { label: '모래시계', requiredClassKeys: ['zero'] })
  .doneStrict();

export type SubWeaponTypeLabel = (typeof subWeaponPartMetaMap)[SubWeaponType]['label'];

export const subWeaponPartLabelMap = Object.fromEntries(subWeaponTypes.map((key) => [key, subWeaponPartMetaMap[key].label])) as {
  [K in SubWeaponType]: (typeof subWeaponPartMetaMap)[K]['label'];
};

export const subWeaponItemRequiredClassOverrideMap = {
  '적녹의 서': ['arch-mage-fire-poison'],
  '청은의 서': ['arch-mage-ice-lightning'],
  '백금의 서': ['bishop'],

  '아스트라 세이크리드 이지스': ['hero', 'paladin'],
  '아스트라 토파즈 이지스': warriorFinalClasses,
  '아스트라 아케인 실드': ['arch-mage-fire-poison', 'arch-mage-ice-lightning', 'bishop'],
  '아스트라 루비 실드': ['flame-wizard'],
  '아스트라 프로미넌트 실드': ['evan'],
  '아스트라 엄브럴 실드': ['battle-mage'],
  '아스트라 베인 실드': ['shadower'],
  '데이모스 워리어 실드': ['hero', 'paladin', 'soul-master'],
  '데이모스 세이지 실드': ['arch-mage-fire-poison', 'arch-mage-ice-lightning', 'bishop'],
  '데이모스 섀도우 실드': ['shadower'],
} as const satisfies Partial<Record<string, readonly ClassKey[]>>;

export const grimoireClassKeys = ['arch-mage-fire-poison', 'arch-mage-ice-lightning', 'bishop'] as const satisfies readonly ClassKey[];

export const subWeaponItemNamePatternRequiredClassOverrideRules = [
  {
    includes: '적녹의 서',
    requiredClassKeys: ['arch-mage-fire-poison'],
  },
  {
    includes: '청은의 서',
    requiredClassKeys: ['arch-mage-ice-lightning'],
  },
  {
    includes: '백금의 서',
    requiredClassKeys: ['bishop'],
  },
] as const satisfies readonly {
  includes: string;
  requiredClassKeys: readonly ClassKey[];
}[];

export function resolveSubWeaponRequiredClassKeys(part: SubWeaponType, itemName: string): readonly ClassKey[] {
  const itemClassOverrideMap: Partial<Record<string, readonly ClassKey[]>> = subWeaponItemRequiredClassOverrideMap;
  const exactOverride = itemClassOverrideMap[itemName];

  if (exactOverride) {
    return exactOverride;
  }

  const patternOverride = subWeaponItemNamePatternRequiredClassOverrideRules.find((rule) => itemName.includes(rule.includes));

  if (patternOverride) {
    return patternOverride.requiredClassKeys;
  }

  return subWeaponPartMetaMap[part].requiredClassKeys;
}
