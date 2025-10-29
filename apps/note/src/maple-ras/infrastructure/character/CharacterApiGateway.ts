import { CharacterEndpoint } from '@/domain/character';
import { ICharacterGateway } from '@/domain/gateways';
import { Character } from '@/domain/character/Character';
// import { transformBasic } from './mapper/transformBasic';
// import { BasicInfo } from '@/domain/character/BasicInfo';
import { nexonBaseApi } from '../http/nexonBaseApi';

// 구현체
export class CharacterApiGateway implements ICharacterGateway {
  async getCharacterByNickname(nick: string): Promise<Character> {
    const response = await nexonBaseApi.get('/id', { params: { character_name: nick } });
    return new Character(response.data.ocid, nick);
  }

  async getCharacterData(
    ocid: string,
    endpoints: CharacterEndpoint[],
    date: string | null = null,
  ): Promise<Record<CharacterEndpoint, unknown>> {
    return this.fetchDataByEndpoints(ocid, date, endpoints);
  }

  /**
   * 공통 데이터 fetch 로직
   */
  private async fetchDataByEndpoints(
    ocid: string,
    date: string | null,
    endpoints: CharacterEndpoint[],
  ): Promise<Record<CharacterEndpoint, unknown>> {
    const requests = await Promise.allSettled(
      endpoints.map((endpoint) => nexonBaseApi.get(`/character/${endpoint}`, { params: { ocid, date } })),
    );

    const acc: Record<CharacterEndpoint, unknown> = {} as Record<CharacterEndpoint, unknown>;

    requests.forEach((res, i) => {
      const endpoint = endpoints[i];
      if (res.status === 'fulfilled') {
        acc[endpoint] = res.value.data;
      } else {
        console.error(`❌ Failed to fetch ${endpoint}:`, res.reason);
      }
    });

    return acc;
  }
}
