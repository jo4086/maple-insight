import type { ClassGroupKey } from '@maple/data-core';

import type { EquipmentType, EquipmentSet } from '@/types';

/** 장비명 중간에 들어가는 직업군 토큰: 하이네스 워리어 헬름 */
const rootAbyssEquipmentClassTokenMap = {
  warrior: '워리어',
  mage: '던위치',
  archer: '레인져',
  thief: '어새신',
  pirate: '원더러',
} as const satisfies Record<ClassGroupKey, string>;

/** 장비명 중간에 들어가는 표준 직업군 토큰: 앱솔랩스 나이트 헬름 */
const standardEquipmentClassTokenMap = {
  warrior: '나이트',
  mage: '메이지',
  archer: '아처',
  thief: '시프',
  pirate: '파이렛',
} as const satisfies Record<ClassGroupKey, string>;

export const equipmentClassTokenRuleMap = {
  /** 루타비스: 하이네스 워리어 헬름 */
  rootAbyss: rootAbyssEquipmentClassTokenMap,
  /** 앱솔랩스: 앱솔랩스 나이트 헬름 */
  absolabs: standardEquipmentClassTokenMap,
  /** 아케인셰이드: 아케인셰이드 나이트 햇 */
  arcaneShade: standardEquipmentClassTokenMap,
  /** 에테르넬: 에테르넬 나이트 헬름 */
  eternal: standardEquipmentClassTokenMap,
} as const satisfies Partial<Record<EquipmentSet, Record<ClassGroupKey, string>>>;

export type EquipmentNamePrefixRule =
  | {
      /** 고정 prefix: 앱솔랩스 나이트 헬름 */
      type: 'fixed';
      /** 장비명 가장 앞에 붙는 문자열 */
      prefix: string;
    }
  | {
      /** 직업군별 prefix: 라이온하트 / 드래곤테일 */
      type: 'classGroup';
      /** 장비명 가장 앞에 붙는 직업군별 문자열 */
      prefixes: Partial<Record<ClassGroupKey, string>>;
    }
  | {
      /** 파츠별 prefix: 하이네스 / 이글아이 / 트릭스터 */
      type: 'part';
      /** 장비명 가장 앞에 붙는 파츠별 문자열 */
      prefixes: Partial<Record<EquipmentType, string>>;
    };

export type EquipmentPartSuffixRule =
  | {
      /** 고정 suffix: 슈즈 / 글러브 / 케이프 */
      type: 'fixed';
      /** 장비명 가장 뒤에 붙는 문자열 */
      suffix: string;
    }
  | {
      /** 직업군별 suffix: 헬름 / 햇 / 베레 */
      type: 'classGroup';
      /** 장비명 가장 뒤에 붙는 직업군별 문자열 */
      suffixes: Partial<Record<ClassGroupKey, string>>;
    };

const rootAbyssHatSuffixRule = {
  type: 'classGroup',
  suffixes: {
    warrior: '헬름',
    mage: '햇',
    archer: '베레',
    thief: '보닛',
    pirate: '햇',
  },
} as const satisfies EquipmentPartSuffixRule;

const classGroupArmorSuffixRule = {
  type: 'classGroup',
  suffixes: {
    warrior: '아머',
    mage: '로브',
    archer: '후드',
    thief: '셔츠',
    pirate: '코트',
  },
} as const satisfies EquipmentPartSuffixRule;

const eternalHatSuffixRule = {
  type: 'classGroup',
  suffixes: {
    warrior: '헬름',
    mage: '햇',
    archer: '후드',
    thief: '반다나',
    pirate: '햇',
  },
} as const satisfies EquipmentPartSuffixRule;

const standardPartSuffixRuleMap = {
  shoulder: { type: 'fixed', suffix: '숄더' },
  cape: { type: 'fixed', suffix: '케이프' },
  shoes: { type: 'fixed', suffix: '슈즈' },
  gloves: { type: 'fixed', suffix: '글러브' },
  bottom: { type: 'fixed', suffix: '팬츠' },
} as const satisfies Partial<Record<EquipmentType, EquipmentPartSuffixRule>>;

export const equipmentNamePrefixRuleMap = {
  /** 시그너스 여제: 직업군별 세트명 prefix */
  cygnusEmpress: {
    type: 'classGroup',
    prefixes: {
      warrior: '라이온하트',
      mage: '드래곤테일',
      archer: '팔콘윙',
      thief: '레이븐혼',
      pirate: '샤크투스',
    },
  },
  /** 루타비스: 파츠별 prefix */
  rootAbyss: {
    type: 'part',
    prefixes: {
      hat: '하이네스',
      top: '이글아이',
      bottom: '트릭스터',
    },
  },
  /** 앱솔랩스: 고정 prefix */
  absolabs: {
    type: 'fixed',
    prefix: '앱솔랩스',
  },
  /** 도전자의 장비: 고정 prefix */
  challenger: {
    type: 'fixed',
    prefix: '도전자의',
  },
  /** 아케인셰이드: 고정 prefix */
  arcaneShade: {
    type: 'fixed',
    prefix: '아케인셰이드',
  },
  /** 에테르넬: 고정 prefix */
  eternal: {
    type: 'fixed',
    prefix: '에테르넬',
  },
  /** 마이스터: 고정 prefix */
  meister: {
    type: 'fixed',
    prefix: '마이스터',
  },
  /** 칠요: 고정 prefix */
  sevenDay: {
    type: 'fixed',
    prefix: '칠요의',
  },
} as const satisfies Partial<Record<EquipmentSet, EquipmentNamePrefixRule>>;

export const equipmentPartSuffixRuleMap = {
  /** 루타비스: 모자/상의는 직업군별 suffix, 하의는 공통 suffix */
  rootAbyss: {
    hat: rootAbyssHatSuffixRule,
    top: classGroupArmorSuffixRule,
    bottom: { type: 'fixed', suffix: '팬츠' },
  },
  /** 시그너스 여제: 직업군별 세트명 prefix + 직업군/파츠별 suffix */
  cygnusEmpress: {
    hat: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀헬름',
        mage: '메이지샐릿',
        archer: '센티널캡',
        thief: '체이서햇',
        pirate: '스키퍼햇',
      },
    },
    overall: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀메일',
        mage: '메이지로브',
        archer: '센티널슈트',
        thief: '체이서아머',
        pirate: '스키퍼코트',
      },
    },
    gloves: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀브레이서',
        mage: '메이지피스트',
        archer: '센티널글러브',
        thief: '체이서글러브',
        pirate: '스키퍼글러브',
      },
    },
    shoes: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀부츠',
        mage: '메이지슈즈',
        archer: '센티널부츠',
        thief: '체이서부츠',
        pirate: '스키퍼부츠',
      },
    },
    cape: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀케이프',
        mage: '메이지케이프',
        archer: '센티널케이프',
        thief: '체이서케이프',
        pirate: '스키퍼케이프',
      },
    },
    shoulder: {
      type: 'classGroup',
      suffixes: {
        warrior: '배틀숄더',
        mage: '메이지숄더',
        archer: '센티널숄더',
        thief: '체이서숄더',
        pirate: '스키퍼숄더',
      },
    },
  },
  /** 앱솔랩스: 모자는 직업군별 suffix, 나머지는 방어구 공통 suffix */
  absolabs: {
    ...standardPartSuffixRuleMap,
    hat: {
      type: 'classGroup',
      suffixes: {
        warrior: '헬름',
        mage: '크라운',
        archer: '후드',
        thief: '캡',
        pirate: '페도라',
      },
    },
    overall: { type: 'fixed', suffix: '슈트' },
  },
  /** 도전자의 장비: 파츠 라벨형 suffix */
  challenger: {
    hat: { type: 'fixed', suffix: '모자' },
    top: { type: 'fixed', suffix: '상의' },
    bottom: { type: 'fixed', suffix: '하의' },
    gloves: { type: 'fixed', suffix: '장갑' },
    shoes: { type: 'fixed', suffix: '신발' },
    cape: { type: 'fixed', suffix: '망토' },
    shoulder: { type: 'fixed', suffix: '어깨장식' },
  },
  /** 아케인셰이드: 방어구 공통 suffix */
  arcaneShade: {
    ...standardPartSuffixRuleMap,
    hat: { type: 'fixed', suffix: '햇' },
    overall: { type: 'fixed', suffix: '슈트' },
  },
  /** 에테르넬: 모자/상의는 직업군별 suffix, 나머지는 공통 suffix */
  eternal: {
    ...standardPartSuffixRuleMap,
    hat: eternalHatSuffixRule,
    top: classGroupArmorSuffixRule,
  },
  /** 마이스터: 장신구 공통 suffix */
  meister: {
    ring: { type: 'fixed', suffix: '링' },
    earring: { type: 'fixed', suffix: '이어링' },
    shoulder: { type: 'fixed', suffix: '숄더' },
  },
  /** 칠요: 뱃지/훈장 suffix */
  sevenDay: {
    badge: { type: 'fixed', suffix: '뱃지' },
    medal: { type: 'fixed', suffix: '메달' },
  },
} as const satisfies Partial<Record<EquipmentSet, Partial<Record<EquipmentType, EquipmentPartSuffixRule>>>>;
