import { nexonBaseApi } from '../../api/baseApi';

import { getSkillGrades, type CharacterEndpoint, type CharacterSkillGrade } from './character.constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type CharacterRequestParams = {
  character_skill_grade?: CharacterSkillGrade;
};

export type CharacterEndpointRequest =
  | CharacterEndpoint
  | {
      endpoint: CharacterEndpoint;
      key?: string;
      params?: CharacterRequestParams;
    };

export const getCharacterOCID = async (nick: string) => {
  try {
    const response = await nexonBaseApi.get('/id', {
      params: {
        character_name: nick,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Request Error:`, error.message);
      throw new Error(error.message || '캐릭터 ocid 조회 중 오류 발생');
    } else {
      console.error(`API Request Error:`, error);
      throw new Error('캐릭터 ocid 조회 중 오류 발생');
    }
  }
};

// INFO: 캐릭터 정보 조회 서비스
export class CharacterService {
  constructor(
    private ocid: string,
    private date: string | null = null,
    private characterClass: string | null = null,
  ) {}

  // INFO: 1. 여러 endpoint를 딜레이를 두고 순차적으로 조회.
  public async getMultipleWithDelay(requests: CharacterEndpointRequest[], delayMs: number = 300) {
    const results: [string, unknown][] = [];

    for (const request of requests) {
      /**
       *  INFO: 1-1. normalizeRequest 함수 호출
       * - ocid외에 다른 query가 필요한 경우*/
      const { key } = this.normalizeRequest(request);

      // INFO: 1-2. call 함수 호출
      const data = await this.call(request);
      results.push([key, data]);
      await delay(delayMs);
    }

    return Object.fromEntries(results);
  }

  // NOTE: 단일 캐릭터 endpoint를 호출하는 진입점
  public async call(request: CharacterEndpointRequest) {
    const { endpoint, params } = this.normalizeRequest(request);
    const data = await this.fetch(endpoint, params);

    if (endpoint === 'basic') {
      this.cacheCharacterClassFromBasic(data);
    }

    return data;
  }

  /*   public async call(request: CharacterEndpointRequest) {
    const { endpoint, params } = this.normalizeRequest(request);
    console.count();
    return this.fetch(endpoint, params);
  } */

  // INFO: (Dead code) 여러 endpoint를 병렬로 조회.
  public async getMultiple(requests: CharacterEndpointRequest[]) {
    const results = await Promise.all(
      requests.map((request) => {
        const { key } = this.normalizeRequest(request);
        return this.call(request).then((data) => [key, data] as const);
      }),
    );

    return Object.fromEntries(results);
  }

  // NOTE: 요청 형태를 endpoint, key, params 구조로 정규화한다
  private normalizeRequest(request: CharacterEndpointRequest) {
    if (typeof request === 'string') {
      return {
        endpoint: request,
        key: request,
        params: undefined,
      };
    }

    return {
      endpoint: request.endpoint,
      key: request.key ?? request.endpoint,
      params: request.params,
    };
  }

  // 실제 넥슨 API에 요청을 보낸다
  private async fetch(endpoint: CharacterEndpoint, params?: CharacterRequestParams) {
    const res = await nexonBaseApi.get(`/character/${endpoint}`, {
      params: { ocid: this.ocid, date: this.date, ...params },
    });
    return res.data;
  }

  private cacheCharacterClassFromBasic(data: unknown) {
    if (!data || typeof data !== 'object') return;

    const basic = data as { character_class?: string };
    if (basic.character_class) {
      this.characterClass = basic.character_class;
    }
  }

  private async ensureCharacterClass() {
    if (this.characterClass) return this.characterClass;

    const basic = await this.fetch('basic');
    this.cacheCharacterClassFromBasic(basic);

    return this.characterClass;
  }

  public createSkillRequests(characterClass: string) {
    return getSkillGrades(characterClass).map((grade) => ({
      endpoint: 'skill' as const,
      key: `skill-${grade}`,
      params: {
        character_skill_grade: grade,
      },
    }));
  }

  public async createRequestsWithSkill(endpoints: CharacterEndpoint[]) {
    const requests: CharacterEndpointRequest[] = [];
    const hasBasic = endpoints.includes('basic');
    const endpointsWithoutSkill = endpoints.filter((endpoint) => endpoint !== 'skill');

    for (const endpoint of endpointsWithoutSkill) {
      requests.push(endpoint);
    }

    if (endpoints.includes('skill')) {
      const characterClass = hasBasic ? (this.characterClass ?? (await this.ensureCharacterClass())) : await this.ensureCharacterClass();

      if (characterClass) {
        requests.push(...this.createSkillRequests(characterClass));
      }
    }

    return requests;
  }
}

export default { getCharacterOCID, CharacterService };
