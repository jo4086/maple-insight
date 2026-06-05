import type {
  CharacterAbility,
  CharacterBasic,
  CharacterBeauty,
  CharacterCashItem,
  CharacterDojang,
  CharacterEquipment,
  CharacterHexamatrix,
  CharacterHexamatrixStat,
  CharacterHyperStat,
  CharacterLinkSkill,
  CharacterOtherStat,
  CharacterPet,
  CharacterPopularity,
  CharacterPropensity,
  CharacterSetEffect,
  CharacterSkill,
  CharacterSpecialRing,
  CharacterStat,
  CharacterSymbol,
  CharacterVmatrix,
} from '@maple/contracts';

export interface SearchNickResponse {
  ability: CharacterAbility;
  equipment: CharacterEquipment;
  basic: CharacterBasic;
  'beauty-equipment': CharacterBeauty;
  'cashitem-equipment': CharacterCashItem;
  dojang: CharacterDojang;
  hexamatrix: CharacterHexamatrix;
  'hexamatrix-stat': CharacterHexamatrixStat;
  'hyper-stat': CharacterHyperStat;
  'link-skill': CharacterLinkSkill;
  'other-stat': CharacterOtherStat;
  'pet-equipment': CharacterPet;
  popularity: CharacterPopularity;
  propensity: CharacterPropensity;
  'set-effect': CharacterSetEffect;
  skill: CharacterSkill;
  'ring-reserve-skill-equipment': CharacterSpecialRing;
  stat: CharacterStat;
  'symbol-equipment': CharacterSymbol;
  vmatrix: CharacterVmatrix;
}
