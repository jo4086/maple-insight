import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const archMageFirePoisonSkills = {
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
    active: ['플레임 오브', '포이즌 브레스', '메디테이션', '이그나이트'],
    passive: ['엘리멘탈 드레인', '매직 액셀레이션', '스펠 마스터리', '하이 위즈덤', 'MP 이터'],
  },
  third: {
    active: ['익스플로젼', '포이즌 미스트', '포이즌 리젼', '엘리멘탈 어뎁팅(불,독)', '텔레포트 마스터리'],
    passive: ['텔레포트 부스트', '엘리멘탈 리셋', '엘리먼트 앰플리피케이션', '매직 크리티컬', '익스트림 매직(불,독)'],
  },
  fourth: {
    active: ['플레임 스윕', '미스트 이럽션', '메테오', '플레임 헤이즈', '이프리트', '메이플 용사', '용사의 의지'],
    passive: ['퍼번트 드레인', '인피니티', '아케인 에임', '마스터 매직'],
  },
  hyper: {
    passive: [
      '포이즌 미스트-리인포스',
      '포이즌 미스트-도트 퍼시스트',
      '포이즌 미스트-도트 리인포스',
      '플레임 스윕-리인포스',
      '플레임 스윕-도트 리인포스',
      '플레임 스윕-보너스 어택',
      '미스트 이럽션-리인포스',
      '미스트 이럽션-이그노어 가드',
      '미스트 이럽션-쿨타임 리듀스',
    ],
    active: ['파이어 오라', '메기도 플레임', '에픽 어드벤쳐'],
  },
  fifth: {
    classActive: ['도트 퍼니셔', '포이즌 노바', '퓨리 오브 이프리트', '포이즌 체인'],
    enhancement: [
      '플레임 스윕 강화',
      '플레임 헤이즈 강화',
      '미스트 이럽션 강화',
      '이그나이트 강화',
      '이프리트 강화',
      '파이어 오라 강화',
      '포이즌 리젼 강화',
      '메테오 강화',
      '메기도 플레임 강화',
      '익스플로젼 강화',
      '텔레포트 마스터리 강화',
      '포이즌 미스트 강화',
      '포이즌 브레스 강화',
      '플레임 오브 강화',
    ],

    linkedGroups: [
      {
        name: '플레임 헤이즈/미스트 이럽션 강화',
        skills: ['플레임 헤이즈 강화', '미스트 이럽션 강화'],
      },
      {
        name: '이그나이트/이프리트/파이어 오라 강화',
        skills: ['이그나이트 강화', '이프리트 강화', '파이어 오라 강화'],
      },
      {
        name: '포이즌 리젼/메테오/메기도 플레임 강화',
        skills: ['포이즌 리젼 강화', '메테오 강화', '메기도 플레임 강화'],
      },
      {
        name: '익스플로젼/텔레포트 마스터리/포이즌 미스트 강화',
        skills: ['익스플로젼 강화', '텔레포트 마스터리 강화', '포이즌 미스트 강화'],
      },
      {
        name: '플레임 오브/포이즌 브레스 강화',
        skills: ['플레임 오브 강화', '포이즌 브레스 강화'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },
  sixth: {
    mastery: ['플레임 스윕 VI', '플레임 헤이즈 VI', '미스트 이럽션 VI', '이그나이트 VI', '이프리트 VI', '파이어 오라 VI', '포이즌 리젼 VI', '메테오 VI', '메기도 플레임 VI'],
    enhancement: ['도트 퍼니셔 강화', '포이즌 노바 강화', '퓨리 오브 이프리트 강화', '포이즌 체인 강화'],
    classActive: ['인페르날 베놈', '토렌셜 플레임'],

    linkedGroups: [
      {
        name: '플레임 헤이즈 VI / 미스트 이럽션 VI',
        skills: ['플레임 헤이즈 VI', '미스트 이럽션 VI'],
      },
      {
        name: '이그나이트 VI / 이프리트 VI / 파이어 오라 VI',
        skills: ['이그나이트 VI', '이프리트 VI', '파이어 오라 VI'],
      },
      {
        name: '포이즌 리젼 VI / 메테오 VI / 메기도 플레임 VI',
        skills: ['포이즌 리젼 VI', '메테오 VI', '메기도 플레임 VI'],
      },
    ],
    commonGroup: ['all', 'mage', 'adventurer'],
  },
} as const satisfies ClassSkillSet;

export type ArchMageFirePoisonSkillName = SkillNameFromSkillSet<typeof archMageFirePoisonSkills>;
