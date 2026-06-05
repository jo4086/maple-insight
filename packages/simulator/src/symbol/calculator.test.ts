import { describe, expect, it } from 'vitest';

import {
  calculateRequiredSymbolGrowth,
  calculateSymbolStat,
  calculateSymbolDailyQuestDays,
  calculateSymbolGrowthRequirement,
  calculateSymbolMeso,
  calculateSymbolStepMeso,
  getSymbolMaxLevel,
} from './calculator';

type ManualResultType = 'meso' | 'growth' | 'daily-quest' | 'stat' | 'max-summary';

const manualInput = {
  currentSymbolName: '어센틱심볼 : 아르테리아',
  currentLevel: 3,
  currentGrowth: 34,
  targetLevel: 11,
  classType: null,
  resultType: 'max-summary',
} as const satisfies {
  currentSymbolName: Parameters<typeof calculateSymbolMeso>[0]['symbolName'];
  currentLevel: number;
  currentGrowth: number;
  targetLevel?: number;
  classType: Parameters<typeof calculateSymbolStat>[0]['classType'];
  resultType: ManualResultType;
};

describe('manual symbol calculator input', () => {
  it('prints result from editable top-level input', () => {
    const commonInput = {
      symbolName: manualInput.currentSymbolName,
      currentLevel: manualInput.currentLevel,
      targetLevel: manualInput.targetLevel,
    };

    const growthInput = {
      ...commonInput,
      currentGrowth: manualInput.currentGrowth,
    };

    const meso = calculateSymbolMeso(commonInput);
    const growth = calculateSymbolGrowthRequirement(growthInput);
    const dailyQuest = calculateSymbolDailyQuestDays(growthInput);
    const stat = calculateSymbolStat({
      symbolName: manualInput.currentSymbolName,
      currentLevel: manualInput.currentLevel,
      classType: manualInput.classType,
    });

    const outputByType: Record<ManualResultType, unknown> = {
      meso: formatMesoResult(meso),
      growth,
      'daily-quest': dailyQuest,
      stat,
      'max-summary': {
        symbolName: manualInput.currentSymbolName,
        currentLevel: manualInput.currentLevel,
        targetLevel: manualInput.targetLevel ?? getSymbolMaxLevel(manualInput.currentSymbolName),
        requiredMeso: formatNumber(meso.totalMeso),
        remainingGrowth: growth.remainingGrowth,
        surplusGrowth: growth.surplusGrowth,
        dailyGrowthGain: dailyQuest.dailyGrowthGain,
        remainingDays: dailyQuest.remainingDays,
        stat: stat.stat,
        forceType: stat.forceType,
        force: stat.force,
      },
    };

    console.log('manual symbol calculator input', manualInput);
    console.log('manual symbol calculator result', outputByType[manualInput.resultType]);

    expect(meso.totalMeso).toBeGreaterThanOrEqual(0);
    if (stat.stat !== null) {
      expect(stat.stat).toBeGreaterThanOrEqual(0);
    }
    expect(stat.force).toBeGreaterThanOrEqual(0);
    expect(growth.remainingGrowth).toBeGreaterThanOrEqual(0);
    expect(dailyQuest.remainingDays).toBeGreaterThanOrEqual(0);
  });
});

describe('symbol calculator', () => {
  it('calculates max levels by symbol type', () => {
    expect(getSymbolMaxLevel('아케인심볼 : 소멸의 여로')).toBe(20);
    expect(getSymbolMaxLevel('어센틱심볼 : 세르니움')).toBe(11);
    expect(getSymbolMaxLevel('그랜드 어센틱심볼 : 탈라하트')).toBe(11);
  });

  it('calculates required growth for each symbol type', () => {
    expect(calculateRequiredSymbolGrowth('아케인심볼 : 소멸의 여로', 10)).toBe(111);
    expect(calculateRequiredSymbolGrowth('어센틱심볼 : 세르니움', 10)).toBe(1100);
    expect(calculateRequiredSymbolGrowth('그랜드 어센틱심볼 : 탈라하트', 10)).toBe(1100);
  });

  it('calculates symbol stat and force by job type', () => {
    expect(
      calculateSymbolStat({
        symbolName: '아케인심볼 : 소멸의 여로',
        currentLevel: 10,
      }),
    ).toMatchObject({
      stat: 1200,
      forceType: 'arcane-force',
      force: 120,
    });

    expect(
      calculateSymbolStat({
        symbolName: '아케인심볼 : 소멸의 여로',
        currentLevel: 10,
        classType: '제논',
      }).stat,
    ).toBe(576);

    expect(
      calculateSymbolStat({
        symbolName: '아케인심볼 : 소멸의 여로',
        currentLevel: 10,
        classType: '데몬어벤져',
      }).stat,
    ).toBe(25200);

    expect(
      calculateSymbolStat({
        symbolName: '어센틱심볼 : 세르니움',
        currentLevel: 10,
      }),
    ).toMatchObject({
      stat: 2300,
      forceType: 'authentic-force',
      force: 100,
    });

    expect(
      calculateSymbolStat({
        symbolName: '그랜드 어센틱심볼 : 탈라하트',
        currentLevel: 10,
      }),
    ).toMatchObject({
      stat: null,
      forceType: 'authentic-force',
      force: 100,
    });
  });

  it('calculates step meso by symbol-specific formula', () => {
    const arcaneStepMeso = calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 10);
    const authenticStepMeso = calculateSymbolStepMeso('어센틱심볼 : 세르니움', 5);
    const grandStepMeso = calculateSymbolStepMeso('그랜드 어센틱심볼 : 탈라하트', 5);

    expect(arcaneStepMeso).toBe(9990000);
    expect(authenticStepMeso).toBe(331500000);
    expect(grandStepMeso).toBe(1196000000);
  });

  it('calculates total meso to max level when target level is omitted', () => {
    const result = calculateSymbolMeso({
      symbolName: '아케인심볼 : 소멸의 여로',
      currentLevel: 19,
    });

    expect(result.targetLevel).toBe(20);
    expect(result.totalMeso).toBe(calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 19));
  });

  it('calculates total meso to a target level', () => {
    const result = calculateSymbolMeso({
      symbolName: '어센틱심볼 : 세르니움',
      currentLevel: 5,
      targetLevel: 7,
    });

    expect(result.totalMeso).toBe(calculateSymbolStepMeso('어센틱심볼 : 세르니움', 5) + calculateSymbolStepMeso('어센틱심볼 : 세르니움', 6));
  });

  it('subtracts owned growth across multiple level-ups', () => {
    const result = calculateSymbolGrowthRequirement({
      symbolName: '아케인심볼 : 소멸의 여로',
      currentLevel: 10,
      currentGrowth: 120,
      targetLevel: 12,
    });

    expect(result.totalRequiredGrowth).toBe(111 + 132);
    expect(result.totalRequiredMeso).toBe(calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 10) + calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 11));
    expect(result.consumedGrowth).toBe(120);
    expect(result.remainingGrowth).toBe(123);
    expect(result.surplusGrowth).toBe(0);
  });

  it('returns surplus growth when owned growth exceeds target requirement', () => {
    const result = calculateSymbolGrowthRequirement({
      symbolName: '아케인심볼 : 소멸의 여로',
      currentLevel: 10,
      currentGrowth: 100,
      targetLevel: 11,
    });

    expect(result.totalRequiredGrowth).toBe(111);
    expect(result.totalRequiredMeso).toBe(calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 10));
    expect(result.remainingGrowth).toBe(11);
    expect(result.surplusGrowth).toBe(0);
  });

  it('calculates surplus growth after target level is satisfied', () => {
    const result = calculateSymbolGrowthRequirement({
      symbolName: '아케인심볼 : 소멸의 여로',
      currentLevel: 10,
      currentGrowth: 200,
      targetLevel: 11,
    });

    expect(result.totalRequiredGrowth).toBe(111);
    expect(result.totalRequiredMeso).toBe(calculateSymbolStepMeso('아케인심볼 : 소멸의 여로', 10));
    expect(result.consumedGrowth).toBe(111);
    expect(result.remainingGrowth).toBe(0);
    expect(result.surplusGrowth).toBe(89);
  });

  it('calculates remaining daily quest days', () => {
    const result = calculateSymbolDailyQuestDays({
      symbolName: '어센틱심볼 : 세르니움',
      currentLevel: 6,
      currentGrowth: 100,
      targetLevel: 11,
    });

    expect(result.dailyGrowthGain).toBe(30);
    expect(result.totalRequiredMeso).toBe(
      calculateSymbolStepMeso('어센틱심볼 : 세르니움', 6) +
        calculateSymbolStepMeso('어센틱심볼 : 세르니움', 7) +
        calculateSymbolStepMeso('어센틱심볼 : 세르니움', 8) +
        calculateSymbolStepMeso('어센틱심볼 : 세르니움', 9) +
        calculateSymbolStepMeso('어센틱심볼 : 세르니움', 10),
    );
    expect(result.remainingGrowth).toBe(3670);
    expect(result.remainingDays).toBe(123);
  });

  it('uses 15 daily growth for non-Cernium authentic and grand authentic symbols', () => {
    expect(
      calculateSymbolDailyQuestDays({
        symbolName: '어센틱심볼 : 아르크스',
        currentLevel: 10,
        currentGrowth: 0,
        targetLevel: 11,
      }).dailyGrowthGain,
    ).toBe(15);

    expect(
      calculateSymbolDailyQuestDays({
        symbolName: '그랜드 어센틱심볼 : 탈라하트',
        currentLevel: 10,
        currentGrowth: 0,
        targetLevel: 11,
      }).dailyGrowthGain,
    ).toBe(15);
  });
});

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatMesoResult(result: ReturnType<typeof calculateSymbolMeso>) {
  return {
    ...result,
    totalMeso: formatNumber(result.totalMeso),
  };
}
