import type { InputStatKey } from '../../stat/input-stat';

/** 스킬 레벨에 따라 변할 수 있는 수치 공식 */
export type SkillFormula =
  | {
      /** 고정값 */
      type: 'fixed';
      /** 고정 수치 */
      value: number;
    }
  | {
      /** base + (level + levelOffset) * perLevel 형태의 선형 공식 */
      type: 'linear';
      /** 기본값 */
      base: number;
      /** 레벨당 증가값 */
      perLevel: number;
      /** 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** base + floor((level + levelOffset) * perLevel) 형태의 정수 내림 선형 공식 */
      type: 'floorLinear';
      /** 기본값 */
      base: number;
      /** 레벨당 증가값 */
      perLevel: number;
      /** 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** base + floor((level + levelOffset) / levelInterval) * amountPerInterval 형태의 정수 내림 구간 공식 */
      type: 'floorLinear';
      /** 기본값 */
      base: number;
      /** 증가가 발생하는 레벨 간격 */
      levelInterval: number;
      /** 구간마다 증가하는 수치, 기본값은 1 */
      amountPerInterval?: number;
      /** 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** base + ceil((level + levelOffset) * perLevel) 형태의 정수 올림 선형 공식 */
      type: 'ceilLinear';
      /** 기본값 */
      base: number;
      /** 레벨당 증가값 */
      perLevel: number;
      /** 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** base + ceil((level + levelOffset) / levelInterval) * amountPerInterval 형태의 정수 올림 구간 공식 */
      type: 'ceilLinear';
      /** 기본값 */
      base: number;
      /** 증가가 발생하는 레벨 간격 */
      levelInterval: number;
      /** 구간마다 증가하는 수치, 기본값은 1 */
      amountPerInterval?: number;
      /** 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** 레벨별 값을 직접 나열하는 테이블 공식 */
      type: 'table';
      /** 레벨 순서대로 나열한 값 */
      values: readonly number[];
      /** 테이블 인덱스 계산용 레벨 보정값 */
      levelOffset?: number;
    }
  | {
      /** 레벨 구간별로 다른 공식을 쓰는 공식 */
      type: 'piecewise';
      /** 레벨 구간별 공식 목록 */
      ranges: readonly SkillFormulaRange[];
    }
  | {
      /** base + level * perLevel + sum(round(logN(level)) * amount) 형태의 로그 보너스 공식 */
      type: 'logLevelBonus';
      /** 기본값 */
      base: number;
      /** 레벨당 증가값, 기본값은 0 */
      perLevel?: number;
      /** 로그 계산 전 레벨 보정값 */
      levelOffset?: number;
      /** 로그값 정수화 방식, 기본값은 floor */
      rounding?: 'floor' | 'ceil';
      /** 로그 보너스 목록 */
      bonuses: readonly SkillLogLevelBonus[];
    };

/** 로그 레벨 보너스 항목 */
export type SkillLogLevelBonus = {
  /** 로그 밑 */
  logBase: number;
  /** 정수화된 로그값에 곱할 수치 */
  amount: number;
};

/** piecewise 공식의 레벨 구간 */
export type SkillFormulaRange = {
  /** 구간 시작 레벨 */
  minLevel: number;
  /** 구간 종료 레벨, 없으면 무제한 */
  maxLevel?: number;
  /** 해당 구간에서 사용할 공식 */
  formula: Exclude<SkillFormula, { type: 'piecewise' }>;
};

/** 자주 쓰는 스킬 공식 프리셋 */
export const skillFormulaPresetMap = {
  /** 현재 스킬 레벨과 같은 값 */
  level: {
    type: 'linear',
    base: 0,
    perLevel: 1,
  },
  ceilLevelIntervalPer2: {
    type: 'ceilLinear',
    base: 0,
    levelInterval: 2,
  },
  ceilLevelIntervalPer3: {
    type: 'ceilLinear',
    base: 0,
    levelInterval: 3,
  },
  ceilLevelIntervalPer4: {
    type: 'ceilLinear',
    base: 0,
    levelInterval: 4,
  },
  ceilLevelIntervalPer5: {
    type: 'ceilLinear',
    base: 0,
    levelInterval: 5,
  },
} as const satisfies Record<string, SkillFormula>;

/** 자주 쓰는 스킬 공식 프리셋 이름 */
export type SkillFormulaPreset = keyof typeof skillFormulaPresetMap;

/** 레벨 구간 공식 생성 옵션 */
export type SkillLevelIntervalFormulaOptions = {
  /** 기본값 */
  base?: number;
  /** 구간마다 증가하는 수치, 기본값은 1 */
  amountPerInterval?: number;
  /** 레벨 보정값 */
  levelOffset?: number;
};

/** 레벨당 선형 공식 생성 옵션 */
export type SkillLevelFormulaOptions = {
  /** 기본값 */
  base?: number;
  /** 레벨 보정값 */
  levelOffset?: number;
};

/** 자주 쓰는 스킬 공식 생성 헬퍼 */
export const skillFormula = {
  /** base + (level + levelOffset) * perLevel 선형 공식 */
  level: (perLevel = 1, options: SkillLevelFormulaOptions = {}): SkillFormula => ({
    type: 'linear',
    base: options.base ?? 0,
    perLevel,
    levelOffset: options.levelOffset,
  }),
  /** floor((level + levelOffset) / levelInterval) 구간 공식 */
  floorLevelInterval: (levelInterval: number, options: SkillLevelIntervalFormulaOptions = {}): SkillFormula => ({
    type: 'floorLinear',
    base: options.base ?? 0,
    levelInterval,
    amountPerInterval: options.amountPerInterval,
    levelOffset: options.levelOffset,
  }),
  /** ceil((level + levelOffset) / levelInterval) 구간 공식 */
  ceilLevelInterval: (levelInterval: number, options: SkillLevelIntervalFormulaOptions = {}): SkillFormula => ({
    type: 'ceilLinear',
    base: options.base ?? 0,
    levelInterval,
    amountPerInterval: options.amountPerInterval,
    levelOffset: options.levelOffset,
  }),
} as const;

/** 공식 또는 이미 계산된 고정 수치 */
export type SkillFormulaValue = number | SkillFormula | SkillFormulaPreset;

/** 공격 수치 공식 */
export type SkillAttackFormula = {
  /** 퍼센트 데미지 */
  damagePercent: SkillFormulaValue;
  /** 공격 횟수 */
  hitCount: SkillFormulaValue;
  /** 같은 공격 묶음의 발동 횟수 */
  repeatCount?: SkillFormulaValue;
  /** 반복 묶음의 사이클 횟수 */
  cycleCount?: SkillFormulaValue;
  /** 최대 공격 대상 수 */
  maxTargets?: SkillFormulaValue;
  /** 일반 몬스터 공격 시 퍼뎀에 더하는 값 */
  addNormalMobDamagePercent?: SkillFormulaValue;
};

/** 지속시간 공식 */
export type SkillDurationFormula = {
  /** 지속시간, 초 단위 */
  durationSec: SkillFormulaValue;
};

/** 재사용 대기시간 공식 */
export type SkillCooldownFormula = {
  /** 재사용 대기시간, 초 단위 */
  cooldownSec: SkillFormulaValue;
};

/** 스킬 딜레이 공식 */
export type SkillDelayFormula =
  | {
      /** 고정 딜레이 */
      type: 'fixed';
      /** 딜레이, 밀리초 단위 */
      delayMs: number;
    }
  | {
      /** 키다운 공격 속도 */
      type: 'keyDown';
      /** 초당 공격 횟수 */
      attacksPerSec: SkillFormulaValue;
      /** 최대 키다운 가능 시간, 초 단위 */
      maxDurationSec?: SkillFormulaValue;
    };

/** 스택 기반 스탯 규칙 */
export type SkillStatStackFormula = {
  /** 최대 스택 수 */
  max?: SkillFormulaValue;
  /** 스택 수를 참조할 원본 스킬 */
  sourceSkill?: string;
};

/** 스탯 적용 조건 */
export type SkillStatCondition = {
  /** 적용 가능한 무기 종류 */
  weaponType?: readonly string[];
  /** 적용 가능한 대상 상태 */
  targetStatus?: readonly string[];
  /** 적용 가능한 캐릭터 소속 */
  characterAffiliation?: readonly string[];
};

/** 스탯 수치 공식 */
export type SkillStatFormula = {
  /** 액티브 버프 적용 여부. 없으면 passive 상시 적용 */
  isActive?: true;
  /** 효과 구간. 없으면 main */
  phase?: 'main' | 'penalty';
  /** 선택형 효과 구분값. 없으면 항상 적용 */
  variant?: string;
  /** 스탯 적용 조건 */
  condition?: SkillStatCondition;
  /** 적용 스탯 이름 */
  stat: InputStatKey;
  /** 이 스탯 수치를 계산할 때 기준으로 삼는 스탯 */
  basedOn?: InputStatKey;
  /** 적용 수치 */
  amount: SkillFormulaValue;
  /** 스택당 적용되는 스탯일 때의 스택 규칙 */
  stack?: SkillStatStackFormula;
  /** 스탯 합산 방식, 기본값은 add */
  stacking?: 'add' | 'overwrite';
};
