import { nexonBaseApi } from '../../../../api/baseApi';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CharacterService {
  constructor(
    private ocid: string,
    private date: string | null = null,
  ) {}

  private async fetch(endpoint: string) {
    const res = await nexonBaseApi.get(`/character/${endpoint}`, {
      params: { ocid: this.ocid, date: this.date },
    });
    return res.data;
  }

  public async call(
    endpoint:
      | 'basic'
      | 'stat'
      | 'hyper-stat'
      | 'item-equipment'
      | 'ability'
      | 'propensity'
      | 'symbol-equipment'
      | 'set-effect'
      | 'hexamatrix-stat'
      | 'other-stat'
      | 'ring-reserve-skill-equipment'
      | 'cashitem-equipment',
  ) {
    console.count();
    return this.fetch(endpoint);
  }

  public async getMultiple(
    endpoints: (
      | 'basic'
      | 'stat'
      | 'hyper-stat'
      | 'item-equipment'
      | 'ability'
      | 'propensity'
      | 'symbol-equipment'
      | 'set-effect'
      | 'hexamatrix-stat'
      | 'other-stat'
      | 'ring-reserve-skill-equipment'
      | 'cashitem-equipment'
    )[],
  ) {
    const results = await Promise.all(endpoints.map((ep) => this.call(ep).then((data) => [ep, data] as const)));
    return Object.fromEntries(results);
  }

  public async getMultipleWithDelay(
    endpoints: (
      | 'basic'
      | 'stat'
      | 'hyper-stat'
      | 'item-equipment'
      | 'ability'
      | 'propensity'
      | 'symbol-equipment'
      | 'set-effect'
      | 'hexamatrix-stat'
      | 'other-stat'
      | 'ring-reserve-skill-equipment'
      | 'cashitem-equipment'
    )[],
    delayMs: number = 300,
  ) {
    const results: [string, unknown][] = [];

    for (const ep of endpoints) {
      const data = await this.call(ep);
      results.push([ep, data]);
      await delay(delayMs);
    }

    return Object.fromEntries(results);
  }
}
