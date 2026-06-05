import type { ArcaneSymbolName, AuthenticSymbolName, GrandSymbolName } from '@maple/game-data/symbol';

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

export const symbolDailyGrowthGainMap: Record<ArcaneSymbolName | AuthenticSymbolName | GrandSymbolName, number> = {
  '아케인심볼 : 소멸의 여로': 40,
  '아케인심볼 : 츄츄 아일랜드': 40,
  '아케인심볼 : 레헬른': 40,
  '아케인심볼 : 아르카나': 40,
  '아케인심볼 : 모라스': 40,
  '아케인심볼 : 에스페라': 40,
  '어센틱심볼 : 세르니움': 30,
  '어센틱심볼 : 아르크스': 15,
  '어센틱심볼 : 오디움': 15,
  '어센틱심볼 : 도원경': 15,
  '어센틱심볼 : 아르테리아': 15,
  '어센틱심볼 : 카르시온': 15,
  '그랜드 어센틱심볼 : 탈라하트': 15,
  '그랜드 어센틱심볼 : 기어드락': 15,
};
