import type { ArcaneSymbolName, AuthenticSymbolName, GrandSymbolName } from './symbol.types';

export const arcaneSymbolAreaValueMap: Record<ArcaneSymbolName, number> = {
  '아케인심볼 : 소멸의 여로': 8,
  '아케인심볼 : 츄츄 아일랜드': 10,
  '아케인심볼 : 레헬른': 12,
  '아케인심볼 : 아르카나': 14,
  '아케인심볼 : 모라스': 16,
  '아케인심볼 : 에스페라': 18,
};

export const authenticSymbolCoefMap: Record<
  AuthenticSymbolName,
  {
    autCoef: number;
    areaCoef: number;
  }
> = {
  '어센틱심볼 : 세르니움': {
    autCoef: 106.8,
    areaCoef: 264,
  },
  '어센틱심볼 : 아르크스': {
    autCoef: 123,
    areaCoef: 300,
  },
  '어센틱심볼 : 오디움': {
    autCoef: 139.2,
    areaCoef: 336,
  },
  '어센틱심볼 : 도원경': {
    autCoef: 155.4,
    areaCoef: 372,
  },
  '어센틱심볼 : 아르테리아': {
    autCoef: 171.6,
    areaCoef: 408,
  },
  '어센틱심볼 : 카르시온': {
    autCoef: 187.8,
    areaCoef: 444,
  },
};

export const grandSymbolCoefMap: Record<
  GrandSymbolName,
  {
    autCoef: number;
    areaCoef: number;
  }
> = {
  '그랜드 어센틱심볼 : 탈라하트': {
    autCoef: 346.2,
    areaCoef: 796,
  },
  '그랜드 어센틱심볼 : 기어드락': {
    autCoef: 427.2,
    areaCoef: 976,
  },
};
