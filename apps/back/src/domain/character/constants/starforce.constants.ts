export interface StarforceLevelCap {
  minLevel: number;
  maxLevel: number;
  maxStarforce: number;
}

export interface StarforceItemException {
  exactName?: string;
  includesAll?: string[];
  includesAny?: string[];
  maxStarforce: number;
}

export const STARFORCE_LEVEL_CAPS: readonly StarforceLevelCap[] = [
  { minLevel: 0, maxLevel: 94, maxStarforce: 5 },
  { minLevel: 95, maxLevel: 107, maxStarforce: 8 },
  { minLevel: 108, maxLevel: 117, maxStarforce: 10 },
  { minLevel: 118, maxLevel: 127, maxStarforce: 15 },
  { minLevel: 128, maxLevel: 137, maxStarforce: 20 },
  { minLevel: 138, maxLevel: 250, maxStarforce: 30 },
] as const;

// NOTE: 기본 레벨 규칙보다 우선 적용되는 예외 장비 목록
export const STARFORCE_ITEM_EXCEPTIONS: readonly StarforceItemException[] = [
  { exactName: '아케인셰이드 블레이드', maxStarforce: 26 },
  { includesAll: ['데스티니'], maxStarforce: 22 },
  { includesAll: ['제네시스'], maxStarforce: 22 },
  { includesAll: ['헬리시움 정예'], maxStarforce: 3 },
  { includesAny: ['노바 히아데스', '노바 헤르메스', '노바 케이론', '노바 리카온', '노바 알테어'], maxStarforce: 8 },
  { includesAny: ['타일런트 히아데스', '타일런트 헤르메스', '타일런트 케이론', '타일런트 리카온', '타일런트 알테어'], maxStarforce: 15 },
] as const;
