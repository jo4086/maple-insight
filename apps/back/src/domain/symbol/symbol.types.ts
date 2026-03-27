export const symbolNames = [
  '아케인심볼 : 소멸의 여로',
  '아케인심볼 : 츄츄 아일랜드',
  '아케인심볼 : 레헬른',
  '아케인심볼 : 아르카나',
  '아케인심볼 : 모라스',
  '아케인심볼 : 에스페라',
  '어센틱심볼 : 세르니움',
  '어센틱심볼 : 아르크스',
  '어센틱심볼 : 오디움',
  '어센틱심볼 : 도원경',
  '어센틱심볼 : 아르테리아',
  '어센틱심볼 : 카르시온',
  '그랜드 어센틱심볼 : 탈라하트',
  '그랜드 어센틱심볼 : 기어드락',
] as const;
export type SymbolName = (typeof symbolNames)[number];

// NOTE: 아케인
export const arcaneSymbolNames = [
  '아케인심볼 : 소멸의 여로',
  '아케인심볼 : 츄츄 아일랜드',
  '아케인심볼 : 레헬른',
  '아케인심볼 : 아르카나',
  '아케인심볼 : 모라스',
  '아케인심볼 : 에스페라',
] as const;
export type ArcaneSymbolName = (typeof arcaneSymbolNames)[number];
export const arcaneSymbolAreaValueMap: Record<ArcaneSymbolName, number> = {
  '아케인심볼 : 소멸의 여로': 8,
  '아케인심볼 : 츄츄 아일랜드': 10,
  '아케인심볼 : 레헬른': 12,
  '아케인심볼 : 아르카나': 14,
  '아케인심볼 : 모라스': 16,
  '아케인심볼 : 에스페라': 18,
};

// NOTE: 어센틱
export const authenticSymbolNames = [
  '어센틱심볼 : 세르니움',
  '어센틱심볼 : 아르크스',
  '어센틱심볼 : 오디움',
  '어센틱심볼 : 도원경',
  '어센틱심볼 : 아르테리아',
  '어센틱심볼 : 카르시온',
] as const;
export type AuthenticSymbolName = (typeof authenticSymbolNames)[number];
type AuthenticKeys = {
  autCoef: number;
  areaCoef: number;
};
export const authenticSymbolCoefMap: Record<AuthenticSymbolName, AuthenticKeys> = {
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

// NOTE: 그랜드 어센틱
export const grandSymbolNames = ['그랜드 어센틱심볼 : 탈라하트', '그랜드 어센틱심볼 : 기어드락'] as const;
export type GrandSymbolName = (typeof grandSymbolNames)[number];
type GrandSymbolKeys = {
  grandCoef: number;
  areaCoef: number;
};
export const grandSymbolCoefMap: Record<GrandSymbolName, GrandSymbolKeys> = {
  '그랜드 어센틱심볼 : 탈라하트': {
    grandCoef: 346.2,
    areaCoef: 796,
  },
  '그랜드 어센틱심볼 : 기어드락': {
    grandCoef: 427.2,
    areaCoef: 976,
  },
};
