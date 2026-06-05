import { describe, expect, it } from 'vitest';

import { calculateLevelStat, calculateLevelStatValue } from './calculator';

describe('level stat calculator', () => {
  it('calculates level stat for general class groups', () => {
    expect(calculateLevelStatValue(260, '전사')).toBe(1318);
    expect(calculateLevelStatValue(260, '마법사')).toBe(1318);
    expect(calculateLevelStatValue(260, '제논')).toBe(1318);
  });

  it('calculates level stat for demon avenger', () => {
    expect(calculateLevelStatValue(260, '데몬어벤져')).toBe(23954);
  });

  it('returns structured result', () => {
    expect(
      calculateLevelStat({
        level: 200,
        classType: '궁수',
      }),
    ).toEqual({
      level: 200,
      classType: '궁수',
      stat: 1018,
    });
  });
});
