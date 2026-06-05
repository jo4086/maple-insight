import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const bishopSkills = {
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
    active: ['홀리 애로우', '힐', '엔젤릭 터치', '블레스'],
    passive: ['블레싱 앙상블', '매직 액셀레이션', '인빈서블', '스펠 마스터리', '하이 위즈덤', 'MP 이터'],
    linkedGroups: [
      {
        name: '힐 / 엔젤릭 터치',
        skills: ['힐', '엔젤릭 터치'],
      },
    ],
  },

  third: {
    active: ['샤이닝 레이', '홀리 파운틴', '파운틴 포 엔젤', '디바인 프로텍션', '미스틱 도어', '디스펠', '트라이엄프 페더', '홀리 심볼', '텔레포트 마스터리', '홀리 매직쉘'],
    passive: ['텔레포트 부스트', '매직 크리티컬', '홀리 포커스'],
    linkedGroups: [
      {
        name: '홀리 파운틴 / 파운틴 포 엔젤',
        skills: ['홀리 파운틴', '파운틴 포 엔젤'],
      },
      {
        name: '디스펠 / 트라이엄프 페더',
        skills: ['디스펠', '트라이엄프 페더'],
      },
    ],
  },

  fourth: {
    active: ['엔젤레이', '제네시스', '빅뱅', '홀리 워터', '홀리 블러드', '리저렉션', '바하뮤트', '어드밴스드 블레스', '메이플 용사', '용사의 의지'],
    passive: ['블레싱 하모니', '인피니티', '마스터 매직', '아케인 에임'],
    internalSkills: ['제네시스-파이널 어택'],
    linkedGroups: [
      {
        name: '홀리 워터 / 홀리 블러드',
        skills: ['홀리 워터', '홀리 블러드'],
      },
    ],
  },

  hyper: {
    passive: [
      '홀리 매직쉘-엑스트라 가드',
      '홀리 매직쉘-퍼시스트',
      '홀리 매직쉘-인핸스',
      '홀리 심볼-익스피리언스',
      '홀리 심볼-임뷰 바디',
      '홀리 심볼-엑스트라 드롭',
      '어드밴스드 블레스-보너스 데미지',
      '어드밴스드 블레스-보스 킬러',
      '어드밴스드 블레스-엑스트라 포인트',
    ],
    active: ['벤전스 오브 엔젤', '헤븐즈 도어', '에픽 어드벤쳐'],
  },

  fifth: {
    classActive: ['프레이', '엔젤 오브 리브라', '피스메이커', '디바인 퍼니시먼트'],
    internalSkills: ['엔젤 오브 리브라-자애의 천사', '엔젤 오브 리브라-복수의 천사', '피스메이커-신성한 빛'],
    enhancement: [
      '엔젤레이 강화',
      '빅뱅 강화',
      '트라이엄프 페더 강화',
      '엔젤릭 터치 강화',
      '파운틴 포 엔젤 강화',
      '바하뮤트 강화',
      '제네시스 강화',
      '헤븐즈 도어 강화',
      '샤이닝 레이 강화',
      '홀리 애로우 강화',
      '힐 강화',
    ],
    linkedGroups: [
      {
        name: '빅뱅/트라이엄프 페더 강화',
        skills: ['빅뱅 강화', '트라이엄프 페더 강화'],
      },
      {
        name: '엔젤릭 터치/파운틴 포 엔젤/바하뮤트 강화',
        skills: ['엔젤릭 터치 강화', '파운틴 포 엔젤 강화', '바하뮤트 강화'],
      },
      {
        name: '제네시스/헤븐즈 도어 강화',
        skills: ['제네시스 강화', '헤븐즈 도어 강화'],
      },
      {
        name: '홀리 애로우/힐 강화',
        skills: ['홀리 애로우 강화', '힐 강화'],
      },
    ],
    derivedGroups: [
      {
        source: '피스메이커',
        skills: ['피스메이커-신성한 빛'],
      },
      {
        source: '엔젤 오브 리브라',
        skills: ['엔젤 오브 리브라-자애의 천사', '엔젤 오브 리브라-복수의 천사'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },

  sixth: {
    mastery: ['엔젤레이 VI', '빅뱅 VI', '트라이엄프 페더 VI', '엔젤릭 터치 VI', '파운틴 포 엔젤 VI', '바하뮤트 VI', '제네시스 VI', '헤븐즈 도어 VI'],
    enhancement: ['프레이 강화', '엔젤 오브 리브라 강화', '피스메이커 강화', '디바인 퍼니시먼트 강화'],
    classActive: ['홀리 어드밴트', '커맨드 오브 헤븐'],

    internalSkills: [
      '엔젤레이 VI-심판의 천사',
      '빅뱅 VI-신성 폭발',
      '제네시스 VI-파이널 어택',
      '홀리 어드밴트-균형의 대천사',
      '홀리 어드밴트-복수의 대천사',
      '홀리 어드밴트-자애의 대천사',
    ],
    linkedGroups: [
      {
        name: '빅뱅 VI / 트라이엄프 페더 VI',
        skills: ['빅뱅 VI', '트라이엄프 페더 VI'],
      },
      {
        name: '엔젤릭 터치 VI / 파운틴 포 엔젤 VI / 바하뮤트 VI',
        skills: ['엔젤릭 터치 VI', '파운틴 포 엔젤 VI', '바하뮤트 VI'],
      },
      {
        name: '제네시스 VI / 헤븐즈 도어 VI',
        skills: ['제네시스 VI', '헤븐즈 도어 VI'],
      },
    ],
    derivedGroups: [
      {
        source: ['엔젤레이 VI', '디바인 퍼니시먼트'],
        skills: ['엔젤레이 VI-심판의 천사'],
        tags: ['성검'],
        desc: '엔젤레이 VI 적중 & 디바인 퍼니시먼트 5회 적중 시 성검 1스택 / 12스택마다 심판의 천사 발동',
      },
      {
        source: '빅뱅 VI',
        condition: {
          kind: 'replace',
          intervalSec: 6,
        },
        skills: ['빅뱅 VI-신성 폭발'],
      },
      {
        source: '홀리 어드밴트',
        skills: ['홀리 어드밴트-자애의 대천사', '홀리 어드밴트-복수의 대천사', '홀리 어드밴트-균형의 대천사'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },
} as const satisfies ClassSkillSet;

export type BishopSkillName = SkillNameFromSkillSet<typeof bishopSkills>;
