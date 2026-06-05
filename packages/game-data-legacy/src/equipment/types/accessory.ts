export const accessoryTypes = ['얼굴장식', '눈장식', '귀고리', '반지', '펜던트', '벨트', '훈장', '어깨장식', '포켓아이템', '뱃지', '엠블렘', '파워소스'] as const;

export type AccessoryType = (typeof accessoryTypes)[number];
