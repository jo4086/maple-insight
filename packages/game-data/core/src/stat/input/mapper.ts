import {
  inputStatMetaMap,
  type InputStatAlias,
  type InputStatKey,
} from './definition';

export const inputStatKeys = Object.keys(inputStatMetaMap) as InputStatKey[];

export const inputStatLabelMap = Object.fromEntries(
  inputStatKeys.map((key) => [key, inputStatMetaMap[key].label]),
) as {
  [K in InputStatKey]: (typeof inputStatMetaMap)[K]['label'];
};

export const inputStatAliasKeyMap = Object.fromEntries(
  inputStatKeys.flatMap((key) => inputStatMetaMap[key].aliases.map((alias) => [alias, key])),
) as Record<InputStatAlias, InputStatKey>;

/** 외부 스탯 이름이나 별칭을 표준 입력 스탯 key로 변환합니다. */
export function normalizeInputStatKey(value: string): InputStatKey | undefined {
  return inputStatAliasKeyMap[value as InputStatAlias];
}
