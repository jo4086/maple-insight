type RequirementOwner = 'system' | 'user';

type DependencyKey = 'system_api_key' | 'user_api_key' | 'ocid' | 'oguild_id' | 'ouid';

export interface ApiEndpointConfig {
  description: string;
  required: string[];
  optional: string[];
  requires: DependencyKey[];
  provides?: DependencyKey[];
}

export const API_ENDPOINTS = {
  common: {
    id: {
      description: '캐릭터 식별(ocid) 조회',
      required: ['character_name'],
      optional: [],
      requires: ['system_api_key'],
      provides: ['ocid'],
    },
    'guild-id': {
      description: '길드 식별(oguild_id) 조회',
      required: ['guild_name', 'world_name'],
      optional: [],
      requires: ['system_api_key'],
      provides: ['oguild_id'],
    },
    ouid: {
      description: '확률 정보 조회 (history)',
      required: [],
      optional: [],
      requires: ['user_api_key'],
      provides: ['ouid'],
    },
  },

  character: {
    basic: {
      description: '기본 정보 조회',
      required: [],
      optional: ['date'],
      requires: ['system_api_key', 'ocid'],
    },
    stat: {
      description: '종합 능력치 정보 조회',
      required: [],
      optional: ['date'],
      requires: ['system_api_key', 'ocid'],
    },
    ability: {
      description: '어빌리티 정보 조회',
      required: [],
      optional: ['date'],
      requires: ['system_api_key', 'ocid'],
    },
  },

  user: {
    basic: {
      description: '유저 기본 정보 조회',
      required: [],
      optional: ['date'],
      requires: ['system_api_key', 'ocid'],
    },
  },

  guild: {
    basic: {
      description: '길드 기본 정보 조회',
      required: [],
      optional: ['date'],
      requires: ['system_api_key', 'oguild_id'],
    },
  },

  history: {
    starforce: {
      description: '스타포스 히스토리 조회',
      required: ['ouid'],
      optional: ['count', 'date'],
      requires: ['user_api_key', 'ouid'],
    },
    potential: {
      description: '잠재능력 히스토리 조회',
      required: ['ouid'],
      optional: ['count', 'date'],
      requires: ['system_api_key', 'ouid'],
    },
  },

  notice: {
    list: {
      description: '공지사항 조회',
      required: [],
      optional: [],
      requires: ['system_api_key'],
    },
    detail: {
      description: '공지사항 상세 조회',
      required: ['notice_id'],
      optional: [],
      requires: ['system_api_key'],
    },
    update: {
      description: '업데이트 조회',
      required: [],
      optional: [],
      requires: ['system_api_key'],
    },
    'update-detail': {
      description: '업데이트 상세 조회',
      required: ['notice_id'],
      optional: [],
      requires: ['system_api_key'],
    },
  },
} as const;
