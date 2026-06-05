import type { ArcaneSymbolName, AuthenticSymbolName, GrandSymbolName, SymbolName } from './symbol-name';

export const ARCANE_SYMBOL_MAX_LEVEL = 20;
export const AUTHENTIC_SYMBOL_MAX_LEVEL = 11;
export const GRAND_SYMBOL_MAX_LEVEL = 11;

export const symbolMaxLevelMap: Record<SymbolName, number> = {
  '아케인심볼 : 소멸의 여로': ARCANE_SYMBOL_MAX_LEVEL,
  '아케인심볼 : 츄츄 아일랜드': ARCANE_SYMBOL_MAX_LEVEL,
  '아케인심볼 : 레헬른': ARCANE_SYMBOL_MAX_LEVEL,
  '아케인심볼 : 아르카나': ARCANE_SYMBOL_MAX_LEVEL,
  '아케인심볼 : 모라스': ARCANE_SYMBOL_MAX_LEVEL,
  '아케인심볼 : 에스페라': ARCANE_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 세르니움': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 아르크스': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 오디움': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 도원경': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 아르테리아': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '어센틱심볼 : 카르시온': AUTHENTIC_SYMBOL_MAX_LEVEL,
  '그랜드 어센틱심볼 : 탈라하트': GRAND_SYMBOL_MAX_LEVEL,
  '그랜드 어센틱심볼 : 기어드락': GRAND_SYMBOL_MAX_LEVEL,
};

export const arcaneSymbolRegionConstantMap: Record<ArcaneSymbolName, number> = {
  '아케인심볼 : 소멸의 여로': 1,
  '아케인심볼 : 츄츄 아일랜드': 2,
  '아케인심볼 : 레헬른': 3,
  '아케인심볼 : 아르카나': 4,
  '아케인심볼 : 모라스': 5,
  '아케인심볼 : 에스페라': 6,
};

export const authenticSymbolRegionConstantMap: Record<AuthenticSymbolName, number> = {
  '어센틱심볼 : 세르니움': 1,
  '어센틱심볼 : 아르크스': 2,
  '어센틱심볼 : 오디움': 3,
  '어센틱심볼 : 도원경': 4,
  '어센틱심볼 : 아르테리아': 5,
  '어센틱심볼 : 카르시온': 6,
};

export const grandSymbolRegionConstantMap: Record<GrandSymbolName, number> = {
  '그랜드 어센틱심볼 : 탈라하트': 0,
  '그랜드 어센틱심볼 : 기어드락': 1,
};
