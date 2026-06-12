export type InputStatMeta = {
  /** 화면 표기명 */
  label: string;
  /** 외부 데이터나 raw 데이터에서 같은 스탯을 가리키는 별칭 */
  aliases: readonly string[];
};

export type InputStatMetaMap = Record<string, InputStatMeta>;

export const inputBaseStatMetaMap = {
  str: { label: '힘', aliases: ['str'] },
  dex: { label: '민첩', aliases: ['dex'] },
  int: { label: '지력', aliases: ['int'] },
  luk: { label: '행운', aliases: ['luk'] },
  'all-stat': { label: '올스탯', aliases: ['all-stat', 'allStat'] },
  'ap-str': { label: 'AP 힘', aliases: ['ap-str', 'apStr'] },
  'ap-dex': { label: 'AP 민첩', aliases: ['ap-dex', 'apDex'] },
  'ap-int': { label: 'AP 지력', aliases: ['ap-int', 'apInt'] },
  'ap-luk': { label: 'AP 행운', aliases: ['ap-luk', 'apLuk'] },
  'ap-hp': { label: 'AP HP', aliases: ['ap-hp', 'apHp'] },
  'level-str': { label: '레벨 9 당 힘', aliases: ['level-str', 'levelStr'] },
  'level-dex': { label: '레벨 9 당 민첩', aliases: ['level-dex', 'levelDex'] },
  'level-int': { label: '레벨 9 당 지력', aliases: ['level-int', 'levelInt'] },
  'level-luk': { label: '레벨 9 당 행운', aliases: ['level-luk', 'levelLuk'] },
  'max-hp': { label: '최대 HP', aliases: ['max-hp', 'maxHp'] },
  'max-mp': { label: '최대 MP', aliases: ['max-mp', 'maxMp'] },
  'max-df': { label: '최대 DF', aliases: ['max-df', 'maxDf', 'maxDF'] },
} as const satisfies InputStatMetaMap;

export const inputPercentStatMetaMap = {
  'str-rate': { label: '힘(%)', aliases: ['str-rate', 'strRate', 'strR'] },
  'dex-rate': { label: '민첩(%)', aliases: ['dex-rate', 'dexRate', 'dexR'] },
  'int-rate': { label: '지력(%)', aliases: ['int-rate', 'intRate', 'intR'] },
  'luk-rate': { label: '행운(%)', aliases: ['luk-rate', 'lukRate', 'lukR'] },
  'all-stat-rate': { label: '올스탯(%)', aliases: ['all-stat-rate', 'allStatRate', 'allStatR'] },
  'ap-str-rate': { label: 'AP로 올린 힘(%)', aliases: ['ap-str-rate', 'apStrRate', 'apStrR'] },
  'ap-dex-rate': { label: 'AP로 올린 민첩(%)', aliases: ['ap-dex-rate', 'apDexRate', 'apDexR'] },
  'ap-int-rate': { label: 'AP로 올린 지력(%)', aliases: ['ap-int-rate', 'apIntRate', 'apIntR'] },
  'ap-luk-rate': { label: 'AP로 올린 행운(%)', aliases: ['ap-luk-rate', 'apLukRate', 'apLukR'] },
  'ap-stat-rate': { label: 'AP로 올린 스탯(%)', aliases: ['ap-stat-rate', 'apStatRate', 'apStatR'] },
  'max-hp-rate': { label: '최대 HP(%)', aliases: ['max-hp-rate', 'maxHpRate', 'maxHpR'] },
  'max-mp-rate': { label: '최대 MP(%)', aliases: ['max-mp-rate', 'maxMpRate', 'maxMpR'] },
} as const satisfies InputStatMetaMap;

export const inputAttackStatMetaMap = {
  'attack-power': { label: '공격력', aliases: ['attack-power', 'attackPower', 'att', 'attPower', 'attack'] },
  'magic-power': { label: '마력', aliases: ['magic-power', 'magicPower', 'mat', 'matPower', 'magic'] },
  'attack-power-rate': {
    label: '공격력(%)',
    aliases: ['attack-power-rate', 'attackPowerRate', 'attRate', 'attackPowerR', 'attackR'],
  },
  'magic-power-rate': {
    label: '마력(%)',
    aliases: ['magic-power-rate', 'magicPowerRate', 'matRate', 'magicPowerR', 'magicR'],
  },
  'weapon-pure-attack-power-rate': {
    label: '순수 무기 공격력 비율(%)',
    aliases: ['weapon-pure-attack-power-rate', 'weaponPureAttackPowerRate'],
  },
  'weapon-mastery': { label: '무기 숙련도(%)', aliases: ['weapon-mastery', 'weaponMastery'] },
} as const satisfies InputStatMetaMap;

export const inputDamageStatMetaMap = {
  damage: { label: '데미지(%)', aliases: ['damage', 'dmg', 'dmgR'] },
  'boss-damage': {
    label: '보스 몬스터 데미지(%)',
    aliases: ['boss-damage', 'bossDamage', 'bossDam', 'bossDamR', 'bossMobDam', 'bossMobDamR'],
  },
  'normal-damage': {
    label: '일반 몬스터 데미지(%)',
    aliases: ['normal-damage', 'normalDamage', 'normalDam', 'normalDamR', 'normalMobDam', 'normalMobDamR'],
  },
  'status-condition-additional-damage': {
    label: '상태 이상 추가 데미지(%)',
    aliases: ['status-condition-additional-damage', 'statusConditionAdditionalDamage', 'statusDam', 'statusDamR'],
  },
  'critical-damage': {
    label: '크리티컬 데미지(%)',
    aliases: ['critical-damage', 'criticalDamage', 'criDamage', 'criDam', 'criDamR'],
  },
  'final-damage': {
    label: '최종 데미지(%)',
    aliases: ['final-damage', 'finalDamage', 'finalDam', 'finalDamR', 'fd'],
  },
} as const satisfies InputStatMetaMap;

export const inputDefenseStatMetaMap = {
  armor: { label: '방어력', aliases: ['armor', 'defense'] },
  'armor-rate': {
    label: '방어력(%)',
    aliases: ['armor-rate', 'armorRate', 'armorR', 'defense-rate', 'defenseRate', 'defenseR'],
  },
  'ignore-monster-armor': {
    label: '몬스터 방어율 무시(%)',
    aliases: [
      'ignore-monster-armor',
      'ignoreMonsterArmor',
      'ignore-monster-defense',
      'ignore-mob-armor',
      'ignore-mob-defense',
      'ima',
      'imd',
      'imaR',
      'imdR',
      'ied',
    ],
  },
  'monster-armor-reduction': {
    label: '몬스터 방어율 감소(%)',
    aliases: [
      'monster-armor-reduction',
      'monsterArmorReduction',
      'monster-defense-reduction',
      'mob-armor-reduction',
      'mob-defense-reduction',
      'mar',
      'marR',
      'mdr',
      'mdrR',
    ],
  },
} as const satisfies InputStatMetaMap;

export const inputCriticalStatMetaMap = {
  'critical-rate': {
    label: '크리티컬 확률(%)',
    aliases: ['critical-rate', 'criticalRate', 'cri', 'criR', 'critical'],
  },
} as const satisfies InputStatMetaMap;

export const inputCooldownStatMetaMap = {
  'cooldown-sec': { label: '재사용 대기시간 감소(초)', aliases: ['cooldown-sec', 'cooldownSec'] },
  'cooldown-rate': { label: '재사용 대기시간 감소(%)', aliases: ['cooldown-rate', 'cooldownRate'] },
  'cooldown-ignore': { label: '재사용 대기시간 미적용(%)', aliases: ['cooldown-ignore', 'cooldownIgnore'] },
} as const satisfies InputStatMetaMap;

export const inputDurationStatMetaMap = {
  'buff-duration-rate': {
    label: '버프 지속시간(%)',
    aliases: ['buff-duration-rate', 'buffDurationRate', 'buff-duration', 'buffDuration', 'bd', 'bdR'],
  },
  'summon-duration-rate': {
    label: '소환수 지속시간(%)',
    aliases: ['summon-duration-rate', 'summonDurationRate', 'summon-duration', 'summonDuration', 'sd', 'sdR'],
  },
} as const satisfies InputStatMetaMap;

export const inputRewardStatMetaMap = {
  'exp-rate': { label: '경험치 획득량 증가(%)', aliases: ['exp-rate', 'expRate'] },
  'meso-rate': { label: '메소 획득량 증가(%)', aliases: ['meso-rate', 'mesoRate'] },
  'drop-rate': { label: '아이템 드랍율 증가(%)', aliases: ['drop-rate', 'dropRate'] },
} as const satisfies InputStatMetaMap;

export const inputResistanceStatMetaMap = {
  'elemental-resistance-rate': {
    label: '모든 속성 저항(%)',
    aliases: ['elemental-resistance-rate', 'elementalResistanceRate', 'elemental-resistance', 'elementalResistance'],
  },
  'elemental-resistance-ignore': {
    label: '속성 내성 무시(%)',
    aliases: [
      'elemental-resistance-ignore',
      'elementalResistanceIgnore',
      'elementalResiIgnore',
      'elemental-resistance-ignore-rate',
      'elementalResistanceIgnoreRate',
      'elementalResiIgnoreR',
    ],
  },
  'status-resistance': { label: '상태 이상 저항', aliases: ['status-resistance', 'statusResistance'] },
} as const satisfies InputStatMetaMap;

export const inputMovementStatMetaMap = {
  speed: { label: '이동 속도', aliases: ['speed'] },
  jump: { label: '점프력', aliases: ['jump'] },
  'max-speed': { label: '최대 이동 속도', aliases: ['max-speed', 'maxSpeed'] },
} as const satisfies InputStatMetaMap;

export const inputUtilityStatMetaMap = {
  'attack-speed': { label: '공격 속도', aliases: ['attack-speed', 'attackSpeed'] },
  stance: { label: '스탠스(%)', aliases: ['stance'] },
  starforce: { label: '스타포스', aliases: ['starforce', 'starForce'] },
  arc: { label: 'ARC', aliases: ['ARC'] },
} as const satisfies InputStatMetaMap;

export const inputStatMetaMap = {
  ...inputBaseStatMetaMap,
  ...inputPercentStatMetaMap,
  ...inputAttackStatMetaMap,
  ...inputDamageStatMetaMap,
  ...inputDefenseStatMetaMap,
  ...inputCriticalStatMetaMap,
  ...inputCooldownStatMetaMap,
  ...inputDurationStatMetaMap,
  ...inputRewardStatMetaMap,
  ...inputResistanceStatMetaMap,
  ...inputMovementStatMetaMap,
  ...inputUtilityStatMetaMap,
} as const satisfies InputStatMetaMap;

export type InputStatKey = keyof typeof inputStatMetaMap;
export type InputStatLabel = (typeof inputStatMetaMap)[InputStatKey]['label'];
export type InputStatAlias = (typeof inputStatMetaMap)[InputStatKey]['aliases'][number];
