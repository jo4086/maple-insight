export const armorTypes = ['모자', '상의', '하의', '한벌옷', '신발', '장갑', '망토'] as const;

export type ArmorType = (typeof armorTypes)[number];
