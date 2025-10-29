/*
 * ignoreMonsterPersonalDefensePenetrationRate
 */

type ArmorSlot = 'top' | 'bottom' | 'hat' | 'glove' | 'cape' | 'shield' | 'shoes' | 'overall';

type AccessorySlot =
  | 'badge'
  | 'belt'
  | 'earrings'
  | 'emblem'
  | 'eye'
  | 'face'
  | 'medal'
  | 'pendant'
  | 'pocket'
  | 'powerSource'
  | 'ring'
  | 'shoulder';

type WeaponType = 'oneHanded' | 'twoHanded';

type WeaponMap = {
  oneHanded:
    | 'shiningRod'
    | 'soulShooter'
    | 'desperado'
    | 'oneHandedSword'
    | 'oneHandedAxe'
    | 'oneHandedBlunt'
    | 'dagger'
    | 'cane'
    | 'wand'
    | 'staff'
    | 'espLimiter'
    | 'chain'
    | 'lucentGauntlet'
    | 'energySword'
    | 'buchae'
    | 'breathShooter'
    | 'bladecaster'
    | 'hwando'
    | 'blade';
  twoHanded:
    | 'twoHandedSword'
    | 'twoHandedAxe'
    | 'twoHandedBlunt'
    | 'spear'
    | 'polearm'
    | 'longSword'
    | 'broadSword'
    | 'revolverGauntlet'
    | 'bow'
    | 'crossBow'
    | 'dualBowguns'
    | 'ancientBow'
    | 'claw'
    | 'chakram'
    | 'knuckle'
    | 'gun'
    | 'handCannon';
};

type WeaponData = {
  [K in keyof WeaponMap]: {
    weaponType: K;
    weapon: WeaponMap[K];
  };
}[keyof WeaponMap];

type OneHandedWeapons =
  | 'shiningRod'
  | 'soulShooter'
  | 'desperado'
  | 'oneHandedSword'
  | 'oneHandedAxe'
  | 'oneHandedBlunt'
  | 'dagger'
  | 'cane'
  | 'wand'
  | 'staff'
  | 'espLimiter'
  | 'chain'
  | 'lucentGauntlet'
  | 'energySword'
  | 'buchae'
  | 'breathShooter'
  | 'bladecaster'
  | 'hwando'
  | 'blade';

type TwoHandedWeapons =
  | 'twoHandedSword'
  | 'twoHandedAxe'
  | 'twoHandedBlunt'
  | 'spear'
  | 'polearm'
  | 'longSword'
  | 'broadSword'
  | 'revolverGauntlet'
  | 'bow'
  | 'crossBow'
  | 'dualBowguns'
  | 'ancientBow'
  | 'claw'
  | 'chakram'
  | 'knuckle'
  | 'gun'
  | 'handCannon';

type equipmentSlot = ArmorSlot | AccessorySlot;

type ignoreSlot = {
  ignore: number;
  type: 'skill' | 'equipment';
  subtype: 'passive' | 'buff' | 'debuff' | 'set-effect' | '장비 부위들';
  // 만약 장비로인한 것이며 서브타입이 세트효과면 어떤세트효과를 루트로 두는지도 체크, 장비로 인한 것이며 특정 부위가 명시된 것 이면 전체부위에서 해당 위치 체크, 만약 타입이 스킬이면 서브타입은 패시브 버프 디버프 이런것만
  // => 이건 전부 런타임에서 알 수 있기에 이건 타입을 미리 정하긴 힘들고 아래 함수에서 조건별 분기로 로직을 짜놔야함
};

export const calcIgnoreDef = ({ ignore }: { ignore: ignoreSlot[] }) => {};
