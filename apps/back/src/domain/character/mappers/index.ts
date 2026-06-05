import type { AndroidRaw, ItemEquipmentRaw } from '@maple/api-character';

import type { CharacterApiEndpoint, CharacterEndpoint } from '../character.constants';

import { toCharacterAbility } from './ability.mapper';
// import { toCharacterAndroid } from '../legacy/mappers/android-equipment.mapper.2604110012';
import { toCharacterBasic } from './basic.mapper';
import { toCharacterBeauty } from './beauty-equipment.mapper';
import { toCharacterCashItem } from './cashitem-equipment.mapper';
import { toCharacterDojang } from './dojang.mapper';
import { toCharacterHexamatrixStat } from './hexamatrix-stat.mapper';
import { toCharacterHexamatrix } from './hexamatrix.mapper';
import { toCharacterHyperStat } from './hyper-stat.mapper';
// import { toCharacterItem } from '../legacy/mappers/item-equipment.mapper.2604110009';
import { toCharacterEquipment } from './item-equipment.mapper';
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

type SingleMappedApiEndpoint = Exclude<CharacterApiEndpoint, 'skill'>;

const API_ENDPOINT_MAPPERS: Partial<Record<SingleMappedApiEndpoint, (value: unknown) => unknown>> = {
  basic: (value) => toCharacterBasic(value as never),
  popularity: (value) => toCharacterPopularity(value as never),
  stat: (value) => toCharacterStat(value as never),
  'hyper-stat': (value) => toCharacterHyperStat(value as never),
  propensity: (value) => toCharacterPropensity(value as never),
  ability: (value) => toCharacterAbility(value as never),
  // 'item-equipment': (value) => toCharacterItem(value as never),
  'cashitem-equipment': (value) => toCharacterCashItem(value as never),
  'symbol-equipment': (value) => toCharacterSymbol(value as never),
  'set-effect': (value) => toCharacterSetEffect(value as never),
  'beauty-equipment': (value) => toCharacterBeauty(value as never),
  // 'android-equipment': (value) => toCharacterAndroid(value as never),
  'pet-equipment': (value) => toCharacterPet(value as never),
  'link-skill': (value) => toCharacterLinkSkill(value as never),
  vmatrix: (value) => toCharacterVmatrix(value as never),
  hexamatrix: (value) => toCharacterHexamatrix(value as never),
  'hexamatrix-stat': (value) => toCharacterHexamatrixStat(value as never),
  dojang: (value) => toCharacterDojang(value as never),
  'other-stat': (value) => toCharacterOtherStat(value as never),
  'ring-reserve-skill-equipment': (value) => toCharacterSpecialRing(value as never),
};

type CompositeMapperParams = {
  mapped: Record<string, unknown>;
  data: CharacterResponseData;
  requestedEndpoints: CharacterEndpoint[];
};

function applySkillComposite({ mapped, data, requestedEndpoints }: CompositeMapperParams) {
  if (!requestedEndpoints.includes('skill')) return;
  if (!Array.isArray(data.skill)) return;

  mapped.skill = data.skill.map((entry) => ({
    classLevel: entry.classLevel,
    info: toCharacterSkill(entry.info as never),
  }));
}

function applyEquipmentComposite({ mapped, data, requestedEndpoints }: CompositeMapperParams) {
  if (!requestedEndpoints.includes('equipment')) return;

  mapped.equipment = toCharacterEquipment(data['item-equipment'] as ItemEquipmentRaw, (data['android-equipment'] as AndroidRaw | undefined) ?? null);
}

const applyCompositeMappers = (params: CompositeMapperParams) => {
  applySkillComposite(params);
  applyEquipmentComposite(params);
};

export function toCharacterResponse(data: CharacterResponseData, requestedEndpoints: CharacterEndpoint[]) {
  const mapped: Record<string, unknown> = {};
  const shouldExposeEquipment = requestedEndpoints.includes('equipment');

  for (const [key, value] of Object.entries(data)) {
    if (key === 'skill') continue;

    if (shouldExposeEquipment && (key === 'item-equipment' || key === 'android-equipment')) {
      continue;
    }

    const mapper = API_ENDPOINT_MAPPERS[key as SingleMappedApiEndpoint];
    mapped[key] = mapper ? mapper(value) : value;
  }

  applyCompositeMappers({ mapped, data, requestedEndpoints });

  return mapped;
}
