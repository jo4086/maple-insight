export const arcaneSymbolNames = [
  '아케인심볼 : 소멸의 여로',
  '아케인심볼 : 츄츄 아일랜드',
  '아케인심볼 : 레헬른',
  '아케인심볼 : 아르카나',
  '아케인심볼 : 모라스',
  '아케인심볼 : 에스페라',
] as const;

export const authenticSymbolNames = [
  '어센틱심볼 : 세르니움',
  '어센틱심볼 : 아르크스',
  '어센틱심볼 : 오디움',
  '어센틱심볼 : 도원경',
  '어센틱심볼 : 아르테리아',
  '어센틱심볼 : 카르시온',
] as const;

export const grandSymbolNames = ['그랜드 어센틱심볼 : 탈라하트', '그랜드 어센틱심볼 : 기어드락'] as const;

export type ArcaneSymbolName = (typeof arcaneSymbolNames)[number];
export type AuthenticSymbolName = (typeof authenticSymbolNames)[number];
export type GrandSymbolName = (typeof grandSymbolNames)[number];

export const symbolNames = [...arcaneSymbolNames, ...authenticSymbolNames, ...grandSymbolNames] as const;

export type SymbolName = (typeof symbolNames)[number];
