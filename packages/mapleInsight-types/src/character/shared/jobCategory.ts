export const jobCategoryMap = {
  전사: 'warrior',
  마법사: 'mage',
  궁수: 'archer',
  도적: 'thief',
  해적: 'pirate',
} as const;
export type JobKo = keyof typeof jobCategoryMap;
export type JobEn = (typeof jobCategoryMap)[JobKo];
