/** 스킬 발동 방식 */
export type SkillActivation = 'active' | 'passive';

/** 공격 스킬의 동작 종류 */
export type AttackSkillKind =
  /** 즉발 공격 */
  | 'instant'
  /** 차지 후 발동하는 공격 */
  | 'charge'
  /** 키다운 중 지속 발동하는 공격 */
  | 'keyDown'
  /** 지속 피해 */
  | 'damageOverTime'
  /** 직접 공격 후 추가로 발동하는 최종 공격 */
  | 'finalAttack'
  /** 사출기 공격 */
  | 'projectile'
  /** 소환수 또는 설치형 공격 */
  | 'summon'
  /** 특정 조건을 만족하면 발동하는 공격 */
  | 'triggered'
  /** 원본 스킬 대신 발동하는 대체/강화 공격 */
  | 'replace';

/** 비공격 스킬의 동작 종류 */
export type NonAttackSkillKind =
  /** 일정 시간 동안 효과를 부여하는 버프 */
  | 'buff'
  /** 적에게 효과를 부여하는 디버프 */
  | 'debuff'
  /** 비공격 소환 또는 소환 상태 */
  | 'summon'
  /** 온오프 토글 */
  | 'toggle'
  /** 배우면 상시 적용되는 패시브 스탯 */
  | 'passiveStat'
  /** 다른 스킬을 강화하는 패시브 효과 */
  | 'passiveSkillEnhancement'
  /** 특정 맵으로 이동 */
  | 'mapTeleport'
  /** 이동기 */
  | 'movement'
  /** 다른 효과 발동을 담당하는 트리거 */
  | 'trigger'
  /** 수치 효과 없이 이펙트만 있는 효과 */
  | 'effect'
  /** 체력 회복 */
  | 'heal'
  /** 상태이상 제거 */
  | 'statusCleanse'
  /** 피해 방어/감소/무적 등 효과 */
  | 'defense'
  /** 사망한 대상 부활 또는 사망 방지/부활 예약 효과 */
  | 'revive';

/** 공격 스킬 효과 메타 */
export type AttackSkillEffectMeta = {
  /** active: 직접 사용/발동, passive: 상시 또는 자동 발동 */
  activation: SkillActivation;
  /** 공격 효과 여부 */
  combatKind: 'attack';
  /** 공격 효과 종류 */
  kind: AttackSkillKind;
};

/** 비공격 스킬 효과 메타 */
export type NonAttackSkillEffectMeta = {
  /** active: 직접 사용/발동, passive: 상시 또는 자동 발동 */
  activation: SkillActivation;
  /** 비공격 효과 여부 */
  combatKind: 'nonAttack';
  /** 비공격 효과 종류 */
  kind: NonAttackSkillKind;
};

/** 스킬 효과 메타 */
export type SkillEffectMeta = AttackSkillEffectMeta | NonAttackSkillEffectMeta;

/** 선행 스킬 조건 */
export type RequiredSkill<TSkillName extends string = string> = {
  /** 선행 스킬명 */
  name: TSkillName;
  /** 필요한 선행 스킬 레벨 */
  level: number;
};

/** 스킬 레벨 상한 확장 조건 */
export type SkillLevelExtension = {
  /** 레벨 상한 확장 출처 */
  source: 'combatOrders';
  /** 추가로 올릴 수 있는 최대 레벨 */
  maxBonusLevel: number;
};

/** 선택형 버프 메타 */
export type SkillSelectableBuffMeta = {
  /** 선택 가능한 버프 구분값 목록 */
  variants: readonly string[];
  /** 동시에 선택할 수 있는 버프 개수 */
  selectCount?: number;
  /** 같은 구분값이 중복으로 적용될 수 있는지 여부 */
  allowDuplicate?: boolean;
  /** 직업/소속별 메타 병합 방식. 없으면 overwrite */
  mergeStrategy?: 'overwrite' | 'add';
};

/** 스킬 사용 모드 메타 */
export type SkillModeMeta = {
  /** 선택 가능한 사용 모드 목록 */
  variants: readonly string[];
  /** 기본 사용 모드 */
  defaultVariant?: string;
};

/** 스킬 특수 계산 규칙 */
export type SkillRuleMeta = {
  /** 크리티컬 확률 100% 초과 계산 허용 여부 */
  allowsCriticalRateOverflow?: true;
  /** 선택형 버프 정보 */
  selectableBuff?: SkillSelectableBuffMeta;
  /** 랜덤형 버프 정보 */
  randomBuff?: SkillSelectableBuffMeta;
  /** 스킬 사용 모드 정보 */
  mode?: SkillModeMeta;
};

/** 스킬 기본 메타 */
export type BaseSkillMeta<TSkillName extends string = string> = {
  /** 전직/습득 시 기본으로 확보된 레벨 */
  initialLevel?: number;
  /** 마스터 레벨 */
  maxLevel?: number;
  /** 레벨/maxLevel/isCombatOrders/levelExtensions를 참조할 원본 스킬 */
  levelSource?: TSkillName;
  /** 컴뱃 오더스/쓸만한 컴뱃 오더스로 레벨 상한을 초과할 수 있는 스킬인지 여부 */
  isCombatOrders?: true;
  /** 마스터 레벨을 초과해 올릴 수 있는 조건 */
  levelExtensions?: readonly SkillLevelExtension[];
  /** 오리진 스킬 여부 */
  isOrigin?: true;
  /** 어센트 스킬 여부 */
  isAscent?: true;
  /** 스킬창에 직접 노출되는 스킬이 아니라 계산/발동 구조 표현용 내부 스킬인지 여부 */
  isInternal?: true;
  /** 스킬 특수 계산 규칙 */
  rules?: SkillRuleMeta;
  /** 습득 가능 레벨 */
  requiredLevel?: number;
  /** 선행 스킬 조건 */
  requiredSkill?: readonly RequiredSkill<TSkillName>[];
  /** 검색/분류용 태그 */
  tags?: readonly string[];
  /** 설명 메모 */
  desc?: string;
};

/** 스킬 메타 */
export type SkillMeta<TSkillName extends string = string> = BaseSkillMeta<TSkillName> & {
  /** 스킬이 가지는 효과 목록 */
  effects: readonly SkillEffectMeta[];
};

/** 스킬 메타 프리셋 확장 입력 */
export type SkillMetaPresetExtension<TSkillName extends string = never> = Partial<BaseSkillMeta<TSkillName>> & {
  /** 기본 효과 뒤에 추가할 효과 목록 */
  effects?: readonly SkillEffectMeta[];
};

/** 확장 가능한 스킬 메타 프리셋 */
export type SkillMetaPreset<TSkillName extends string = never> = {
  /** 기본 메타를 유지하면서 일부 필드와 효과를 추가/변경 */
  extend: <TTargetSkillName extends string = TSkillName>(extension: SkillMetaPresetExtension<TTargetSkillName>) => SkillMeta<TTargetSkillName>;
};

/** 스킬 메타 헬퍼의 레벨 입력값 */
export type SkillMetaLevelInput<TSkillName extends string = never> = number | TSkillName | BaseSkillMeta<TSkillName>;

const createSkillMetaPreset = <T extends SkillMeta<string>>(base: T): T & SkillMetaPreset<string> => {
  const extend = <TTargetSkillName extends string = never>(extension: SkillMetaPresetExtension<TTargetSkillName>): SkillMeta<TTargetSkillName> => ({
    ...base,
    ...extension,
    effects: [...base.effects, ...(extension.effects ?? [])],
  });

  Object.defineProperty(base, 'extend', {
    enumerable: false,
    value: extend,
  });

  return base as T & SkillMetaPreset<string>;
};

const createSkillMeta = <TSkillName extends string = never>(
  level: SkillMetaLevelInput<TSkillName> | undefined,
  effects: readonly SkillEffectMeta[],
): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName> => {
  const levelMeta = typeof level === 'number' ? { maxLevel: level } : typeof level === 'string' ? { levelSource: level } : (level ?? {});

  return createSkillMetaPreset({
    ...levelMeta,
    effects,
  } as SkillMeta<TSkillName>) as SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
};

type SkillMetaHelper = {
  (): SkillMeta<never> & SkillMetaPreset<never>;
  (level: number): SkillMeta<never> & SkillMetaPreset<never>;
  <TSkillName extends string>(level: TSkillName): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
  <TSkillName extends string>(level: BaseSkillMeta<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
};

type TypedSkillMetaHelper<TSkillName extends string> = {
  (): SkillMeta<never> & SkillMetaPreset<never>;
  (level: number): SkillMeta<never> & SkillMetaPreset<never>;
  (level: TSkillName): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
  (level: BaseSkillMeta<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
};

type SkillMetaHelperMap<TSkillName extends string = string> = {
  level: TypedSkillMetaLevelHelper<TSkillName>;
  activeAttackInstant: TypedSkillMetaHelper<TSkillName>;
  activeAttackSummon: TypedSkillMetaHelper<TSkillName>;
  activeAttackKeyDown: TypedSkillMetaHelper<TSkillName>;
  activeAttackProjectile: TypedSkillMetaHelper<TSkillName>;
  activeAttackTriggered: TypedSkillMetaHelper<TSkillName>;
  activeAttackReplace: TypedSkillMetaHelper<TSkillName>;
  passiveAttackTriggered: TypedSkillMetaHelper<TSkillName>;
  passiveAttackSummon: TypedSkillMetaHelper<TSkillName>;
  passiveAttackProjectile: TypedSkillMetaHelper<TSkillName>;
  passiveFinalAttack: TypedSkillMetaHelper<TSkillName>;
  activeBuff: TypedSkillMetaHelper<TSkillName>;
  passiveBuff: TypedSkillMetaHelper<TSkillName>;
  passiveStat: TypedSkillMetaHelper<TSkillName>;
  passiveHeal: TypedSkillMetaHelper<TSkillName>;
  passiveTrigger: TypedSkillMetaHelper<TSkillName>;
  activeMovement: TypedSkillMetaHelper<TSkillName>;
  activeDebuff: TypedSkillMetaHelper<TSkillName>;
  activeHeal: TypedSkillMetaHelper<TSkillName>;
  activeSummon: TypedSkillMetaHelper<TSkillName>;
  activeToggle: TypedSkillMetaHelper<TSkillName>;
  activeRevive: TypedSkillMetaHelper<TSkillName>;
  passiveSkillEnhance: TypedSkillMetaHelper<TSkillName>;
  hyperPassiveSkill: typeof hyperPassiveSkill;
  vmatrixEnhanceCore: typeof vmatrixEnhanceCore;
  hexamatrixEnhanceCore: typeof hexamatrixEnhanceCore;
};

const createSkillMetaHelper = (effects: readonly SkillEffectMeta[]): SkillMetaHelper =>
  ((level?: SkillMetaLevelInput<string>) => createSkillMeta(level, effects)) as SkillMetaHelper;

const effect = {
  activeAttackInstant: { activation: 'active', combatKind: 'attack', kind: 'instant' },
  activeAttackSummon: { activation: 'active', combatKind: 'attack', kind: 'summon' },
  activeAttackKeyDown: { activation: 'active', combatKind: 'attack', kind: 'keyDown' },
  activeAttackProjectile: { activation: 'active', combatKind: 'attack', kind: 'projectile' },
  activeAttackTriggered: { activation: 'active', combatKind: 'attack', kind: 'triggered' },
  activeAttackReplace: { activation: 'active', combatKind: 'attack', kind: 'replace' },
  passiveAttackTriggered: { activation: 'passive', combatKind: 'attack', kind: 'triggered' },
  passiveAttackSummon: { activation: 'passive', combatKind: 'attack', kind: 'summon' },
  passiveAttackProjectile: { activation: 'passive', combatKind: 'attack', kind: 'projectile' },
  passiveFinalAttack: { activation: 'passive', combatKind: 'attack', kind: 'finalAttack' },
  activeBuff: { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
  passiveBuff: { activation: 'passive', combatKind: 'nonAttack', kind: 'buff' },
  passiveStat: { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
  passiveHeal: { activation: 'passive', combatKind: 'nonAttack', kind: 'heal' },
  passiveTrigger: { activation: 'passive', combatKind: 'nonAttack', kind: 'trigger' },
  activeMovement: { activation: 'active', combatKind: 'nonAttack', kind: 'movement' },
  activeDebuff: { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
  activeHeal: { activation: 'active', combatKind: 'nonAttack', kind: 'heal' },
  activeSummon: { activation: 'active', combatKind: 'nonAttack', kind: 'summon' },
  activeToggle: { activation: 'active', combatKind: 'nonAttack', kind: 'toggle' },
  activeRevive: { activation: 'active', combatKind: 'nonAttack', kind: 'revive' },
  passiveSkillEnhance: { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
} as const satisfies Record<string, SkillEffectMeta>;

/** 자주 쓰는 스킬 효과 프리셋 이름 */
export type SkillEffectPresetName = keyof typeof effect;

/** 스킬 메타 헬퍼의 effect 입력값 */
export type SkillMetaEffectInput = SkillEffectPresetName | SkillEffectMeta;

/** 스킬 메타 헬퍼 옵션 */
export type SkillMetaLevelOptions<TSkillName extends string = never> = Partial<BaseSkillMeta<TSkillName>> & {
  /** 스킬 효과 프리셋 이름 또는 커스텀 효과 목록 */
  effects: readonly SkillMetaEffectInput[];
};

type TypedSkillMetaLevelHelper<TSkillName extends string> = {
  (options: SkillMetaLevelOptions<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
  (level: number, options: SkillMetaLevelOptions<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
  (level: TSkillName, options: SkillMetaLevelOptions<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
  (level: BaseSkillMeta<TSkillName>, options: SkillMetaLevelOptions<TSkillName>): SkillMeta<TSkillName> & SkillMetaPreset<TSkillName>;
};

const resolveEffects = (effects: readonly SkillMetaEffectInput[]): SkillEffectMeta[] =>
  effects.map((skillEffect) => (typeof skillEffect === 'string' ? effect[skillEffect] : skillEffect));

const createSkillMetaLevelHelper = (): TypedSkillMetaLevelHelper<string> =>
  ((levelOrOptions: SkillMetaLevelInput<string> | SkillMetaLevelOptions<string>, options?: SkillMetaLevelOptions<string>) => {
    const hasLevelInput = options !== undefined;
    const level = hasLevelInput ? (levelOrOptions as SkillMetaLevelInput<string>) : undefined;
    const metaOptions = hasLevelInput ? options : (levelOrOptions as SkillMetaLevelOptions<string>);
    const { effects, ...restOptions } = metaOptions;

    return createSkillMeta(level, resolveEffects(effects)).extend(restOptions);
  }) as TypedSkillMetaLevelHelper<string>;

/** V 매트릭스 강화 코어 기본 메타 */
export const vmatrixEnhanceCore = createSkillMetaPreset({
  maxLevel: 60,
  effects: [
    {
      activation: 'passive',
      combatKind: 'nonAttack',
      kind: 'passiveSkillEnhancement',
    },
  ],
} as const satisfies SkillMeta<string>);

/** HEXA 매트릭스 강화 코어 기본 메타 */
export const hexamatrixEnhanceCore = createSkillMetaPreset({
  maxLevel: 30,
  effects: [
    {
      activation: 'passive',
      combatKind: 'nonAttack',
      kind: 'passiveSkillEnhancement',
    },
  ],
} as const satisfies SkillMeta<string>);

/** 하이퍼 패시브 스킬 기본 메타 */
export const hyperPassiveSkill = createSkillMetaPreset({
  maxLevel: 1,
  effects: [
    {
      activation: 'passive',
      combatKind: 'nonAttack',
      kind: 'passiveSkillEnhancement',
    },
  ],
} as const satisfies SkillMeta<string>);

/** 자주 쓰는 스킬 메타 생성 헬퍼 */
export const meta = {
  of: <TSkillName extends string>() => meta as unknown as SkillMetaHelperMap<TSkillName>,
  level: createSkillMetaLevelHelper(),
  activeAttackInstant: createSkillMetaHelper([effect.activeAttackInstant]),
  activeAttackSummon: createSkillMetaHelper([effect.activeAttackSummon]),
  activeAttackKeyDown: createSkillMetaHelper([effect.activeAttackKeyDown]),
  activeAttackProjectile: createSkillMetaHelper([effect.activeAttackProjectile]),
  activeAttackTriggered: createSkillMetaHelper([effect.activeAttackTriggered]),
  activeAttackReplace: createSkillMetaHelper([effect.activeAttackReplace]),
  passiveAttackTriggered: createSkillMetaHelper([effect.passiveAttackTriggered]),
  passiveAttackSummon: createSkillMetaHelper([effect.passiveAttackSummon]),
  passiveAttackProjectile: createSkillMetaHelper([effect.passiveAttackProjectile]),
  passiveFinalAttack: createSkillMetaHelper([effect.passiveFinalAttack]),
  activeBuff: createSkillMetaHelper([effect.activeBuff]),
  passiveBuff: createSkillMetaHelper([effect.passiveBuff]),
  passiveStat: createSkillMetaHelper([effect.passiveStat]),
  passiveHeal: createSkillMetaHelper([effect.passiveHeal]),
  passiveTrigger: createSkillMetaHelper([effect.passiveTrigger]),
  activeMovement: createSkillMetaHelper([effect.activeMovement]),
  activeDebuff: createSkillMetaHelper([effect.activeDebuff]),
  activeHeal: createSkillMetaHelper([effect.activeHeal]),
  activeSummon: createSkillMetaHelper([effect.activeSummon]),
  activeToggle: createSkillMetaHelper([effect.activeToggle]),
  activeRevive: createSkillMetaHelper([effect.activeRevive]),
  passiveSkillEnhance: createSkillMetaHelper([effect.passiveSkillEnhance]),
  hyperPassiveSkill,
  vmatrixEnhanceCore,
  hexamatrixEnhanceCore,
} as const;

export type AttackSkillNameFromSkillMeta<TSkillMeta extends Record<string, SkillMeta<string>>> = {
  [K in keyof TSkillMeta]: Extract<TSkillMeta[K]['effects'][number], { combatKind: 'attack' }> extends never ? never : K;
}[keyof TSkillMeta] &
  string;

export type ActiveSkillNameFromSkillMeta<TSkillMeta extends Record<string, SkillMeta<string>>> = {
  [K in keyof TSkillMeta]: Extract<TSkillMeta[K]['effects'][number], { activation: 'active' }> extends never ? never : K;
}[keyof TSkillMeta] &
  string;
