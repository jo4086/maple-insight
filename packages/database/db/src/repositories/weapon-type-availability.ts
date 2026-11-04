export const WEAPON_CLASS_GROUP_KEYS = ['warrior', 'archer', 'mage', 'thief', 'pirate'] as const;

export type WeaponTypeAvailability = {
  availabilityMode: 'common' | 'class_groups' | 'job_ids';
  classGroupKeys: readonly string[];
  allowedJobIds: readonly string[];
};

export type EffectiveEquipmentAvailability =
  | { source: 'weapon_type' | 'item_override'; mode: 'common'; classGroupKeys: []; allowedJobIds: [] }
  | { source: 'weapon_type' | 'item_override'; mode: 'class_groups'; classGroupKeys: string[]; allowedJobIds: [] }
  | { source: 'weapon_type'; mode: 'job_ids'; classGroupKeys: []; allowedJobIds: string[] }
  | { source: 'item_override'; requiredClass: string | string[] }
  | { source: 'legacy'; requiredClass: unknown };

const classGroupKeys = new Set<string>(WEAPON_CLASS_GROUP_KEYS);

function assertUniqueNonempty(values: readonly string[]): void {
  if (
    values.length === 0 ||
    values.some((value) => value.length === 0 || value.trim() !== value) ||
    new Set(values).size !== values.length
  ) {
    throw new Error('Invalid requiredClassOverride');
  }
}

function resolveOverride(value: unknown): EffectiveEquipmentAvailability {
  if (value === '공용') {
    return { source: 'item_override', mode: 'common', classGroupKeys: [], allowedJobIds: [] };
  }

  const values = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(values) || values.some((entry) => typeof entry !== 'string')) {
    throw new Error('Invalid requiredClassOverride');
  }
  assertUniqueNonempty(values);
  if (values.includes('공용')) throw new Error('Invalid requiredClassOverride');

  if (values.every((entry) => classGroupKeys.has(entry))) {
    return { source: 'item_override', mode: 'class_groups', classGroupKeys: [...values], allowedJobIds: [] };
  }
  return {
    source: 'item_override',
    requiredClass: typeof value === 'string' ? value : [...values],
  };
}

export function resolveEffectiveEquipmentAvailability(input: {
  weaponType: WeaponTypeAvailability | null;
  requiredClassOverride: unknown | null;
  legacyRequiredClass: unknown;
}): EffectiveEquipmentAvailability {
  if (!input.weaponType) return { source: 'legacy', requiredClass: input.legacyRequiredClass };
  if (input.requiredClassOverride !== null) return resolveOverride(input.requiredClassOverride);

  const type = input.weaponType;
  if (type.availabilityMode === 'common' && type.classGroupKeys.length === 0 && type.allowedJobIds.length === 0) {
    return { source: 'weapon_type', mode: 'common', classGroupKeys: [], allowedJobIds: [] };
  }
  if (type.availabilityMode === 'class_groups' && type.classGroupKeys.length > 0 && type.allowedJobIds.length === 0) {
    return { source: 'weapon_type', mode: 'class_groups', classGroupKeys: [...type.classGroupKeys], allowedJobIds: [] };
  }
  if (type.availabilityMode === 'job_ids' && type.classGroupKeys.length === 0 && type.allowedJobIds.length > 0) {
    return { source: 'weapon_type', mode: 'job_ids', classGroupKeys: [], allowedJobIds: [...type.allowedJobIds] };
  }
  throw new Error('Invalid weapon type availability');
}
