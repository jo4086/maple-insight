import type {
  CharacterAbility,
  CharacterAndroid,
  CharacterBasic,
  CharacterBeauty,
  CharacterCashItem,
  CharacterDojang,
  CharacterHexamatrix,
  CharacterHexamatrixStat,
  CharacterHyperStat,
  CharacterItem,
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
} from '@maple/types';

export interface SearchNickResponse {
  ability: CharacterAbility;
  'android-equipment': CharacterAndroid;
  basic: CharacterBasic;
  'beauty-equipment': CharacterBeauty;
  'cashitem-equipment': CharacterCashItem;
  dojang: CharacterDojang;
  hexamatrix: CharacterHexamatrix;
  'hexamatrix-stat': CharacterHexamatrixStat;
  'hyper-stat': CharacterHyperStat;
  'item-equipment': CharacterItem;
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
