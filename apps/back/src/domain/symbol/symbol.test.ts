import { describe, expect, it } from 'vitest';

import { calculateArcaneSymbolMaterialStepCount, calculateAuthenticSymbolStepCost, calculateGrandSymbolStepCost } from './symbol.calculator';
import { arcaneSymbolAreaValueMap, authenticSymbolCoefMap, grandSymbolCoefMap } from './symbol.constants';
import type { ArcaneSymbolName, AuthenticSymbolName, GrandSymbolName } from './symbol.types';

const VANISHING: ArcaneSymbolName = '아케인심볼 : 소멸의 여로';
const CHEWCHEW: ArcaneSymbolName = '아케인심볼 : 츄츄 아일랜드';
const LACHELN: ArcaneSymbolName = '아케인심볼 : 레헬른';
const ARCANA: ArcaneSymbolName = '아케인심볼 : 아르카나';
const MORAS: ArcaneSymbolName = '아케인심볼 : 모라스';
const ESFERA: ArcaneSymbolName = '아케인심볼 : 에스페라';

const CERNIUM: AuthenticSymbolName = '어센틱심볼 : 세르니움';
const ARCS: AuthenticSymbolName = '어센틱심볼 : 아르크스';
const ODIUM: AuthenticSymbolName = '어센틱심볼 : 오디움';
const DOWONKYUNG: AuthenticSymbolName = '어센틱심볼 : 도원경';
const ARTERIA: AuthenticSymbolName = '어센틱심볼 : 아르테리아';
const CARCION: AuthenticSymbolName = '어센틱심볼 : 카르시온';

const TALLAHART: GrandSymbolName = '그랜드 어센틱심볼 : 탈라하트';
const GEARDRAK: GrandSymbolName = '그랜드 어센틱심볼 : 기어드락';

describe('calculateAuthenticSymbolMeso', () => {
  const levels = [3];

  const testCases = [
    {
      name: CERNIUM,
      aut: authenticSymbolCoefMap[CERNIUM].autCoef,
      area: authenticSymbolCoefMap[CERNIUM].areaCoef,
    },
    {
      name: ARCS,
      aut: authenticSymbolCoefMap[ARCS].autCoef,
      area: authenticSymbolCoefMap[ARCS].areaCoef,
    },
    {
      name: ODIUM,
      aut: authenticSymbolCoefMap[ODIUM].autCoef,
      area: authenticSymbolCoefMap[ODIUM].areaCoef,
    },
    {
      name: DOWONKYUNG,
      aut: authenticSymbolCoefMap[DOWONKYUNG].autCoef,
      area: authenticSymbolCoefMap[DOWONKYUNG].areaCoef,
    },
    {
      name: ARTERIA,
      aut: authenticSymbolCoefMap[ARTERIA].autCoef,
      area: authenticSymbolCoefMap[ARTERIA].areaCoef,
    },
    {
      name: CARCION,
      aut: authenticSymbolCoefMap[CARCION].autCoef,
      area: authenticSymbolCoefMap[CARCION].areaCoef,
    },
  ];

  testCases.forEach(({ name, aut, area }) => {
    describe(`${name}`, () => {
      levels.forEach((level) => {
        it(`level ${level}`, () => {
          console.log(`지역: ${name}`);
          console.log(`레벨: ${level}`);

          const result = calculateAuthenticSymbolStepCost(name, level);

          const expected = level > 10 ? 0 : Math.floor(-5.4 * level ** 3 + aut * level ** 2 + area * level) * 100000;

          console.log(`결과: ${formatNumber(result)}`);
          console.log(`기대값: ${formatNumber(expected)}`);

          expect(result).toBe(expected);
        });
      });
    });
  });
});

describe('calculateGrandSymbolMeso', () => {
  const levels = [5];

  const testCases: { name: GrandSymbolName; aut: number; area: number }[] = [
    {
      name: TALLAHART,
      aut: grandSymbolCoefMap[TALLAHART].autCoef,
      area: grandSymbolCoefMap[TALLAHART].areaCoef,
    },
    {
      name: GEARDRAK,
      aut: grandSymbolCoefMap[GEARDRAK].autCoef,
      area: grandSymbolCoefMap[GEARDRAK].areaCoef,
    },
  ];

  testCases.forEach(({ name, aut, area }) => {
    describe(`${name}`, () => {
      levels.forEach((level) => {
        it(`level ${level}`, () => {
          console.log(`지역: ${name}`);
          console.log(`레벨: ${level}`);

          const result = calculateGrandSymbolStepCost(name, level);

          const expected = level > 10 ? 0 : Math.floor(-5.4 * level ** 3 + aut * level ** 2 + area * level) * 100000;

          console.log(`결과: ${formatNumber(result)}`);
          console.log(`기대값: ${formatNumber(expected)}`);

          expect(result).toBe(expected);
        });
      });
    });
  });
});

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

describe('아케인 심볼 필요 재료수', () => {
  const levels = [13];

  const testCases: { name: ArcaneSymbolName; area: number }[] = [
    {
      name: VANISHING,
      area: arcaneSymbolAreaValueMap[VANISHING],
    },
    {
      name: CHEWCHEW,
      area: arcaneSymbolAreaValueMap[CHEWCHEW],
    },
    {
      name: LACHELN,
      area: arcaneSymbolAreaValueMap[LACHELN],
    },
    {
      name: ARCANA,
      area: arcaneSymbolAreaValueMap[ARCANA],
    },
    {
      name: MORAS,
      area: arcaneSymbolAreaValueMap[MORAS],
    },
    {
      name: ESFERA,
      area: arcaneSymbolAreaValueMap[ESFERA],
    },
  ];

  testCases.forEach(({ name }) => {
    describe(`${name}`, () => {
      levels.forEach((level) => {
        it(`level: ${level}`, () => {
          const currentCount = 28;
          const result = calculateArcaneSymbolMaterialStepCount(name, level, currentCount);

          const expected = level > 19 ? 0 : Math.max(0, level ** 2 + 11 - currentCount);

          console.log(`result: `, result);
          console.log(`기댓값: `, expected);

          expect(result).toBe(expected);
        });
      });
    });
  });
});
