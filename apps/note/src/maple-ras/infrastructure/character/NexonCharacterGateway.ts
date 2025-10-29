// 📁 infrastructure/character/NexonCharacterGateway.ts
import { nexonBaseApi } from '../http/nexonBaseApi';

import { Character } from '@/domain/character';
import { ICharacterGateway } from '@/domain/gateways';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class NexonCharacterGateway implements ICharacterGateway {
  async getCharacterByNickname(nick: string): Promise<Character> {
    const response = await nexonBaseApi.get('/id', { params: { character_name: nick } });
    return new Character(response.data.ocid, nick);
  }

  async getCharacterData(
    ocid: string,
    endpoints: Array<string>,
    date: string | null = null,
  ): Promise<Record<string, unknown>> {
    const results: [string, unknown][] = [];

    for (const ep of endpoints) {
      const res = await nexonBaseApi.get(`/character/${ep}`, { params: { ocid, date } });
      results.push([ep, res.data]);
      await delay(300);
    }

    return Object.fromEntries(results);
  }
}
