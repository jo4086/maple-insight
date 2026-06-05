import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const archMageIceLightningSkills = {
  link: ['임피리컬 널리지'],

  zero: {
    active: [],
    passive: [],
    commonGroup: ['all'],
  },

  first: {
    active: ['에너지 볼트', '텔레포트', '마나 웨이브'],
    passive: ['매직 가드', '매직 아머', 'MP 증가'],
  },

  second: {
    active: ['콜드 빔', '썬더 볼트', '아이스 오라', '메디테이션'],
    passive: ['프리징 이펙트', '매직 액셀레이션', '스펠 마스터리', '하이 위즈덤', 'MP 이터'],
  },

  third: {
    active: ['아이스 스트라이크', '글레이셜 월', '썬더 스피어', '텔레포트 마스터리'],
    passive: ['텔레포트 부스트', '프로즌 브레이크', '엘리멘탈 리셋', '매직 크리티컬', '익스트림 매직(썬,콜)', '엘리먼트 앰플리피케이션'],
  },

  fourth: {
    active: ['체인 라이트닝', '프리징 브레스', '블리자드', '프로즌 오브', '엘퀴네스', '메이플 용사', '용사의 의지'],
    passive: ['마스터 매직', '아케인 에임', '프로스트 이펙트', '인피니티'],
    internalSkills: ['블리자드-파이널 어택'],
  },

  hyper: {
    passive: [
      '텔레포트 마스터리-리인포스',
      '텔레포트 마스터리-엑스트라 타겟',
      '텔레포트 마스터리-애드 레인지',
      '체인 라이트닝-리인포스',
      '체인 라이트닝-엑스트라 타겟',
      '체인 라이트닝-보너스 어택',
      '프로즌 오브-리인포스',
      '프로즌 오브-엑스트라 타겟',
      '프로즌 오브-크리티컬 레이트',
    ],
    active: ['글레이셜 퓨리', '라이트닝 스피어', '에픽 어드벤쳐'],
  },

  fifth: {
    classActive: ['프로스트 아크', '썬더 브레이크', '스피릿 오브 스노우', '주피터 썬더'],
    internalSkills: ['주피터 썬더-감전', '주피터 썬더-전류'],
    enhancement: ['체인 라이트닝 강화', '프로즌 오브 강화', '블리자드 강화', '라이트닝 스피어 강화', '썬더 스피어 강화', '엘퀴네스 강화', '콜드 빔 강화', '썬더 볼트 강화'],

    linkedGroups: [
      {
        name: '프로즌 오브/블리자드 강화',
        skills: ['프로즌 오브 강화', '블리자드 강화'],
      },
      {
        name: '썬더 스피어/엘퀴네스 강화',
        skills: ['썬더 스피어 강화', '엘퀴네스 강화'],
      },
      {
        name: '글레이셜 윌/아이스 스트라이크 강화',
        skills: ['글레이셜 윌 강화', '아이스 스트라이크 강화'],
      },
      {
        name: '콜드 빔/썬더 볼트 강화',
        skills: ['콜드 빔 강화', '썬더 볼트 강화'],
      },
    ],
    derivedGroups: [
      {
        source: '주피터 썬더',
        skills: ['주피터 썬더-감전'],
      },
      {
        source: '주피터 썬더-감전',
        skills: ['주피터 썬더-전류'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },

  sixth: {
    mastery: ['체인 라이트닝 VI', '프로즌 오브 VI', '블리자드 VI', '라이트닝 스피어 VI', '크라이오 쇼크', '썬더 스피어 VI', '엘퀴네스 VI'],
    internalSkills: ['체인 라이트닝 VI-전류지대', '블리자드 VI-파이널 어택'],
    enhancement: ['프로스트 아크 강화', '썬더 브레이크 강화', '스피릿 오브 스노우 강화', '주피터 썬더 강화'],
    classActive: ['프로즌 라이트닝', '파라볼릭 볼트'],

    linkedGroups: [
      {
        name: '프로즌 오브 VI / 블리자드 VI',
        skills: ['프로즌 오브 VI', '블리자드 VI'],
      },
      {
        name: '라이트닝 스피어 VI',
        skills: ['라이트닝 스피어 VI', '크라이오 쇼크'],
      },
      {
        name: '썬더 스피어 VI / 엘퀴네스 VI',
        skills: ['썬더 스피어 VI', '엘퀴네스 VI'],
      },
    ],
    derivedGroups: [
      {
        source: '체인 라이트닝 VI',
        skills: ['체인 라이트닝 VI-전류지대'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },
} as const satisfies ClassSkillSet;

export type ArchMageIceLightningName = SkillNameFromSkillSet<typeof archMageIceLightningSkills>;
