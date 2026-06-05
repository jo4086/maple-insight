import type { ItemPotentialGrade, PotentialOptionGradeRateRow, PotentialOptionValueUnit } from '../types/cube';
import type { PotentialGrade, PotentialOption } from '../types';

export const potentialLineKeys = ['firstLine', 'secondLine', 'thirdLine'] as const;
export type PotentialLineKey = (typeof potentialLineKeys)[number];

export type CubePotentialOptionRate = {
  /** 잠재 옵션 key */
  optionKey: PotentialOption;
  /** 옵션 수치. 잡옵이라 상세 수치를 쓰지 않을 때는 생략할 수 있다. */
  value?: number;
  /** 수치 단위 */
  unit?: PotentialOptionValueUnit;
  /** 공격/피격 발동형 옵션의 발동 확률 */
  chancePercent?: number;
  /** 최종 등장 확률. 단위는 percent point다. */
  rate: number;
};

export type CubePotentialOptionRateByTopGrade = Partial<
  Record<ItemPotentialGrade, Partial<Record<PotentialLineKey, Partial<Record<PotentialGrade, readonly CubePotentialOptionRate[]>>>>>
>;

export type CubePotentialOptionWeight = Omit<CubePotentialOptionRate, 'rate'> & {
  /** 동일 옵션 등급 안에서의 상대 가중치 */
  weight: number;
};

export type CubePotentialOptionWeightMap = Partial<Record<PotentialGrade, readonly CubePotentialOptionWeight[]>>;

export type CubeLineGradeBudgetMap = Partial<
  Record<ItemPotentialGrade, Partial<Record<PotentialLineKey, Partial<Record<PotentialGrade, number>>>>>
>;

type CubePotentialOptionContext = Omit<CubePotentialOptionRate, 'rate'> & {
  optionGrade: PotentialGrade;
};

const potentialLineKeyMap = {
  1: 'firstLine',
  2: 'secondLine',
  3: 'thirdLine',
} as const satisfies Record<number, PotentialLineKey>;

function pushOptionRate(
  table: Record<string, Record<string, Record<string, CubePotentialOptionRate[]>>>,
  topGrade: ItemPotentialGrade,
  line: PotentialLineKey,
  optionGrade: PotentialGrade,
  option: CubePotentialOptionRate,
): void {
  table[topGrade] ??= {};
  table[topGrade][line] ??= {};
  table[topGrade][line][optionGrade] ??= [];
  table[topGrade][line][optionGrade].push(option);
}

export class CubePotentialRateBuilder {
  private readonly table: Record<string, Record<string, Record<string, CubePotentialOptionRate[]>>> = {};
  private currentOption: CubePotentialOptionContext | undefined;

  option(
    optionGrade: PotentialGrade,
    optionKey: PotentialOption,
    metadata: Omit<CubePotentialOptionContext, 'optionGrade' | 'optionKey'> = {},
  ): this {
    this.currentOption = {
      optionGrade,
      optionKey,
      ...metadata,
    };

    return this;
  }

  rate(topGrade: ItemPotentialGrade, line: PotentialLineKey, rate: number): this {
    if (this.currentOption === undefined) {
      throw new Error('CubePotentialRateBuilder.rate() must be called after option().');
    }

    const { optionGrade, ...option } = this.currentOption;

    pushOptionRate(this.table, topGrade, line, optionGrade, {
      ...option,
      rate,
    });

    return this;
  }

  done(): CubePotentialOptionRateByTopGrade {
    return this.table as CubePotentialOptionRateByTopGrade;
  }
}

export function createCubePotentialRateBuilder(): CubePotentialRateBuilder {
  return new CubePotentialRateBuilder();
}

export function createCubeLineGradeBudgetMap(rows: readonly PotentialOptionGradeRateRow[]): CubeLineGradeBudgetMap {
  const budgetMap: Record<string, Record<string, Record<string, number>>> = {};

  for (const row of rows) {
    const lineKey = potentialLineKeyMap[row.line];

    budgetMap[row.itemGrade] ??= {};
    budgetMap[row.itemGrade][lineKey] ??= {};
    budgetMap[row.itemGrade][lineKey][row.optionGrade] = row.rate;
  }

  return budgetMap as CubeLineGradeBudgetMap;
}

function createOptionRatesByWeight(options: readonly CubePotentialOptionWeight[], budgetRate: number): readonly CubePotentialOptionRate[] {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

  if (totalWeight <= 0) {
    return [];
  }

  return options.map(({ weight, ...option }) => ({
    ...option,
    rate: (budgetRate * weight) / totalWeight,
  }));
}

export function createCubePotentialRateByWeight({
  optionWeightMap,
  lineGradeBudgetMap,
}: {
  optionWeightMap: CubePotentialOptionWeightMap;
  lineGradeBudgetMap: CubeLineGradeBudgetMap;
}): CubePotentialOptionRateByTopGrade {
  const rateMap: Record<string, Record<string, Record<string, readonly CubePotentialOptionRate[]>>> = {};

  for (const [itemGrade, lineBudgetMap] of Object.entries(lineGradeBudgetMap)) {
    rateMap[itemGrade] ??= {};

    for (const [line, gradeBudgetMap] of Object.entries(lineBudgetMap)) {
      rateMap[itemGrade][line] ??= {};

      for (const [optionGrade, budgetRate] of Object.entries(gradeBudgetMap)) {
        const options = optionWeightMap[optionGrade as PotentialGrade];

        if (options === undefined) {
          continue;
        }

        rateMap[itemGrade][line][optionGrade] = createOptionRatesByWeight(options, budgetRate);
      }
    }
  }

  return rateMap as CubePotentialOptionRateByTopGrade;
}
