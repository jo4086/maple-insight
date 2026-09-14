import { describe, expect, it } from 'vitest';

import { characterBase } from './character';

describe('characterBase', () => {
  it('calculates general class stats by advancement stage', () => {
    expect(characterBase({ level: 100, job: '히어로', classLevel: 3 })).toEqual({
      mainStats: ['STR'],
      statValue: 513,
    });
    expect(characterBase({ level: 275, job: '아크', classLevel: 4 })).toEqual({
      mainStats: ['STR'],
      statValue: 1393,
    });
  });

  it('calculates demon avenger HP by advancement stage', () => {
    expect(characterBase({ level: 100, job: '데몬어벤져', classLevel: 3 })).toEqual({
      mainStats: ['HP'],
      statValue: 9479,
    });
    expect(characterBase({ level: 100, job: '데몬어벤져', classLevel: 4 })).toEqual({
      mainStats: ['HP'],
      statValue: 9554,
    });
  });

  it('returns every main stat for xenon', () => {
    expect(characterBase({ level: 200, job: '제논', classLevel: 4 }).mainStats).toEqual(['STR', 'DEX', 'LUK']);
  });
});
