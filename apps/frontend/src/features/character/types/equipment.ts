type EquipmentLayoutCell = {
  slot: string;
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
};

export const EQUIPMENT_LAYOUT: EquipmentLayoutCell[] = [
  { slot: '반지4', col: 1, row: 1 },
  { slot: '얼굴장식', col: 2, row: 1 },
  { slot: 'character-preview', col: 3, row: 1, colSpan: 3, rowSpan: 4 },
  { slot: '모자', col: 6, row: 1 },
  { slot: '망토', col: 7, row: 1 },

  { slot: '반지3', col: 1, row: 2 },
  { slot: '눈장식', col: 2, row: 2 },
  { slot: '상의', col: 6, row: 2 },
  { slot: '장갑', col: 7, row: 2 },

  { slot: '반지2', col: 1, row: 3 },
  { slot: '귀고리', col: 2, row: 3 },
  { slot: '하의', col: 6, row: 3 },
  { slot: '신발', col: 7, row: 3 },

  { slot: '반지1', col: 1, row: 4 },
  { slot: '펜던트2', col: 2, row: 4 },
  { slot: '어깨장식', col: 6, row: 4 },
  { slot: '훈장', col: 7, row: 4 },

  { slot: '벨트', col: 1, row: 5 },
  { slot: '펜던트', col: 2, row: 5 },
  { slot: '무기', col: 3, row: 5 },
  { slot: '보조무기', col: 4, row: 5 },
  { slot: '엠블렘', col: 5, row: 5 },
  { slot: '안드로이드', col: 6, row: 5 },
  { slot: '기계 심장', col: 7, row: 5 },

  { slot: '포켓 아이템', col: 1, row: 6 },
  { slot: '뱃지', col: 7, row: 6 },
] as const;
