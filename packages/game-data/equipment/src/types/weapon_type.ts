import { type ClassGroupKey, type FinalClassNameKey } from '@maple/data-core';

import type { WeaponHandType } from './index';

type WeaponTypeAvailability =
  | {
      readonly isDedicated: false;
      readonly availabilityMode: 'common';
      readonly classGroupKeys: readonly [];
      readonly allowedJobIds: readonly [];
    }
  | {
      readonly isDedicated: false;
      readonly availabilityMode: 'class_groups';
      readonly classGroupKeys: readonly [ClassGroupKey, ...ClassGroupKey[]];
      readonly allowedJobIds: readonly [];
    }
  | {
      readonly isDedicated: false;
      readonly availabilityMode: 'job_ids';
      readonly classGroupKeys: readonly [];
      readonly allowedJobIds: readonly [string, ...string[]];
    }
  | {
      readonly isDedicated: true;
      readonly availabilityMode: 'job_ids';
      readonly classGroupKeys: readonly [];
      readonly allowedJobIds: readonly [string];
    };

type WeaponTypeRecordBase = {
  readonly id: bigint;
  readonly part: string;
  readonly normalizedPart: string;
};

type WeaponConstantOverride = {
  readonly jobId: FinalClassNameKey;
  readonly weaponConstant: number;
};

export type WeaponTypeRecord = WeaponTypeRecordBase &
  WeaponTypeAvailability &
  (
    | {
        readonly category: 'weapon';
        readonly handType: WeaponHandType;
        /** 1 is slowest; 8 is fastest. */
        readonly attackSpeed: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
        readonly weaponConstant: number;
        readonly weaponConstantOverrides: readonly WeaponConstantOverride[] | null;
      }
    | {
        readonly category: 'subWeapon';
      }
  );

type WeaponRecord = Extract<WeaponTypeRecord, { readonly category: 'weapon' }>;

export function resolveWeaponTypeConstant(weaponType: WeaponRecord, jobId: FinalClassNameKey): number {
  return (
    weaponType.weaponConstantOverrides?.find((override) => override.jobId === jobId)?.weaponConstant ??
    weaponType.weaponConstant
  );
}
