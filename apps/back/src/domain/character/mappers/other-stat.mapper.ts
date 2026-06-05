import type { OtherStatRaw } from '@maple/api-character';
import type { CharacterOtherStat, OtherStat } from '@maple/contracts';

type OtherStatItemRaw = NonNullable<OtherStatRaw['other_stat']>[number];
type StatInfoRaw = NonNullable<OtherStatItemRaw['stat_info']>[number];

function toStatInfo(raw: StatInfoRaw): OtherStat['info'][number] {
  return {
    name: raw.stat_name ?? '',
    value: raw.stat_value ?? '',
  };
}

function toOtherStat(raw: OtherStatItemRaw): OtherStat {
  return {
    type: raw.other_stat_type ?? '',
    info: (raw.stat_info ?? []).map(toStatInfo),
  };
}

export function toCharacterOtherStat(raw: OtherStatRaw): CharacterOtherStat {
  return {
    date: raw.date,
    otherStats: (raw.other_stat ?? []).map(toOtherStat),
  };
}
