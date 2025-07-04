import { getValidatedApiKeys } from '../middlewares/validators';

import type { EnvMapType, ApiStructure } from './config.type';

const requiredAPIKeyMap: EnvMapType = {
  nexon: 'NEXON_API_KEY',
};
export const config = {
  apiKey: getValidatedApiKeys(requiredAPIKeyMap),
};

export function createApiConfig<T extends ApiStructure>(config: T): T {
  return config;
}
export const API_URL = createApiConfig({
  nexon: {
    base: 'https://open.api.nexon.com/maplestory/v1',
    secParams: {
      ocid: 'ocid',
      ouid: 'ouid',
      guildId: 'guild/id',
    },
    category: {
      stat: {
        secParams: 'ocid',
        endpoint: {
          character: [
            'stat',
            'hyper-stat',
            'ability',
            'hexamatrix-stat',
            'set-effect',
            'propensity',
          ],
          user: ['union', 'union-raider', 'union-artifact', 'union-champion'],
        },
      },
      skill: {
        secParams: 'ocid',
        endpoint: {
          character: ['skill', 'vmatrix', 'hexamatrix', 'link-skill'],
        },
      },
      basic: {
        secParams: 'ocid',
        endpoint: {
          character: ['basic', 'item-equipment', 'symbol-equipment', 'ability'],
        },
      },
    },
  },
});
export function generateMapleStoryApiUrls(ocid: string): Record<string, string[]> {
  const categorizedUrls: Record<string, string[]> = {};
  // API_URL은 같은 모듈 안에 있으므로 바로 접근합니다.
  const nexonConfig = API_URL.nexon;
  const base = nexonConfig.base;

  // Object.entries를 사용해 카테고리 이름('stat' 등)과 내용을 함께 가져옵니다.
  for (const [categoryName, categoryDetails] of Object.entries(nexonConfig.category)) {
    const urlsForCategory: string[] = [];
    const { endpoint } = categoryDetails;

    // 이 함수는 ocid를 사용한다고 가정합니다.
    // 나중에 다른 파라미터(guildId 등)가 필요하면 더 확장할 수 있습니다.
    const paramQuery = `ocid=${ocid}`;

    if ('character' in endpoint) {
      for (const e of endpoint.character) {
        urlsForCategory.push(`${base}/character/${e}?${paramQuery}`);
      }
    }

    if ('user' in endpoint) {
      for (const e of endpoint.user) {
        urlsForCategory.push(`${base}/user/${e}?${paramQuery}`);
      }
    }

    if (urlsForCategory.length > 0) {
      categorizedUrls[categoryName] = urlsForCategory;
    }
  }

  return categorizedUrls;
}

const myOcid = 'asd1234';
const mapleUrls = generateMapleStoryApiUrls(myOcid);

console.log(mapleUrls);
