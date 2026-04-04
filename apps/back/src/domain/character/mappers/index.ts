import { CharacterEndpoint } from '../character.constants';

import { toCharacterAbility } from './ability.mapper';
import { toCharacterAndroid } from './android-equipment.mapper';
import { toCharacterBasic } from './basic.mapper';
import { toCharacterBeauty } from './beauty-equipment.mapper';
import { toCharacterCashItem } from './cashitem-equipment.mapper';
import { toCharacterDojang } from './dojang.mapper';
import { toCharacterHexamatrixStat } from './hexamatrix-stat.mapper';
import { toCharacterHexamatrix } from './hexamatrix.mapper';
import { toCharacterHyperStat } from './hyper-stat.mapper';
import { toCharacterItem } from './item-equipment.mapper';
import { toCharacterLinkSkill } from './link-skill.mapper';
import { toCharacterOtherStat } from './other-stat.mapper';
import { toCharacterPet } from './pet-equipment.mapper';
import { toCharacterPopularity } from './popularity.mapper';
import { toCharacterPropensity } from './propensity.mapper';
import { toCharacterSpecialRing } from './ring-reserve-skill-equipment.mapper';
import { toCharacterSetEffect } from './set-effect.mapper';
import { toCharacterSkill } from './skill.mapper';
import { toCharacterStat } from './stat.mapper';
import { toCharacterSymbol } from './symbol-equipment.mapper';
import { toCharacterVmatrix } from './vmatrix.mapper';

type CharacterResponseData = Partial<Record<CharacterEndpoint, unknown>> & {
  skill?: { classLevel: string; info: unknown }[];
};

const endpointMappers: Partial<Record<CharacterEndpoint, (value: unknown) => unknown>> = {
  basic: (value) => toCharacterBasic(value as never),
  popularity: (value) => toCharacterPopularity(value as never),
  stat: (value) => toCharacterStat(value as never),
  'hyper-stat': (value) => toCharacterHyperStat(value as never),
  propensity: (value) => toCharacterPropensity(value as never),
  ability: (value) => toCharacterAbility(value as never),
  'item-equipment': (value) => toCharacterItem(value as never),
  'cashitem-equipment': (value) => toCharacterCashItem(value as never),
  'symbol-equipment': (value) => toCharacterSymbol(value as never),
  'set-effect': (value) => toCharacterSetEffect(value as never),
  'beauty-equipment': (value) => toCharacterBeauty(value as never),
  'android-equipment': (value) => toCharacterAndroid(value as never),
  'pet-equipment': (value) => toCharacterPet(value as never),
  'link-skill': (value) => toCharacterLinkSkill(value as never),
  vmatrix: (value) => toCharacterVmatrix(value as never),
  hexamatrix: (value) => toCharacterHexamatrix(value as never),
  'hexamatrix-stat': (value) => toCharacterHexamatrixStat(value as never),
  dojang: (value) => toCharacterDojang(value as never),
  'other-stat': (value) => toCharacterOtherStat(value as never),
  'ring-reserve-skill-equipment': (value) => toCharacterSpecialRing(value as never),
};

export function toCharacterResponse(data: CharacterResponseData) {
  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === 'skill' && Array.isArray(value)) {
      mapped.skill = value.map((entry) => ({
        classLevel: entry.classLevel,
        info: toCharacterSkill(entry.info as never),
      }));
      continue;
    }

    const mapper = endpointMappers[key as CharacterEndpoint];
    mapped[key] = mapper ? mapper(value) : value;
  }

  return mapped;
}
