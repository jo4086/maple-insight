import type { ClassGroup } from '@maple/data-core';

export const normalSetNames = ['마이스터 세트', '칠요 세트', '보스 장신구 세트', '여명의 보스 세트', '칠흑의 보스 세트', '광휘의 보스 세트'] as const;

/** 직업군 표시를 괄호로 붙여 세트 효과명을 구분하는 세트명 */
export const prefixSetNames = ['시그너스 여제 세트', '루타비스 세트', '앱솔랩스 세트', '아케인셰이드 세트', '에테르넬 세트'] as const;

// 세트뒤에 prefix붙나 안붙나 세트효과는 동일하니 base 세트효과를 붙이고
// 나중에 세트명(prefix) 한다음에 해당 직군의 아이템들이 리스트로 뜨게하고
// 세트효과는 여기에 적힌 값을 그대로 오버라이드

export type NormalSetName = (typeof normalSetNames)[number];
export type PrefixSetName = (typeof prefixSetNames)[number];
export type ClassGroupSuffixedSetName = `${PrefixSetName}(${ClassGroup})`;
export type SetEffectName = NormalSetName | ClassGroupSuffixedSetName;
